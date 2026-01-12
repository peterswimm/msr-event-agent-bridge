#requires -Version 7.0
<#
.SYNOPSIS
    Verify CMK infrastructure deployment and connectivity
.DESCRIPTION
    Tests that Key Vault is accessible, the CMK key exists, and managed identity has proper permissions.
.PARAMETER ResourceGroupName
    Azure resource group containing the CMK infrastructure
.PARAMETER KeyVaultName
    Name of the Key Vault (optional - will auto-discover if not specified)
.EXAMPLE
    ./verify-cmk-setup.ps1 -ResourceGroupName "event-hub-rg"
.NOTES
    Requires Azure CLI
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory = $false)]
    [string]$KeyVaultName
)

$ErrorActionPreference = "Stop"

Write-Host "✅ CMK Infrastructure Verification" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Auto-discover Key Vault if not specified
if ([string]::IsNullOrEmpty($KeyVaultName)) {
    Write-Host "🔍 Auto-discovering Key Vault in resource group: $ResourceGroupName" -ForegroundColor Yellow
    
    $vaults = az keyvault list --resource-group $ResourceGroupName --query "[].name" -o tsv
    
    if ($null -eq $vaults -or @($vaults).Count -eq 0) {
        Write-Host "❌ No Key Vaults found in resource group" -ForegroundColor Red
        exit 1
    }
    
    if (@($vaults).Count -gt 1) {
        Write-Host "⚠️  Multiple Key Vaults found, using first one" -ForegroundColor Yellow
    }
    
    $KeyVaultName = @($vaults)[0]
    Write-Host "✅ Using Key Vault: $KeyVaultName" -ForegroundColor Green
}

Write-Host ""

# Test 1: Key Vault exists and is accessible
Write-Host "Test 1️⃣  Checking Key Vault access..." -ForegroundColor Yellow

$keyVault = az keyvault show --name $KeyVaultName --resource-group $ResourceGroupName --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -ne 0 -or $null -eq $keyVault) {
    Write-Host "❌ Cannot access Key Vault: $KeyVaultName" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Key Vault accessible" -ForegroundColor Green
Write-Host "   URI: $($keyVault.properties.vaultUri)" -ForegroundColor Gray
Write-Host "   Soft Delete: $($keyVault.properties.enableSoftDelete)" -ForegroundColor Gray
Write-Host "   Purge Protection: $($keyVault.properties.enablePurgeProtection)" -ForegroundColor Gray

# Test 2: CMK key exists
Write-Host ""
Write-Host "Test 2️⃣  Checking CMK key..." -ForegroundColor Yellow

$keys = az keyvault key list --vault-name $KeyVaultName --output json | ConvertFrom-Json

if ($null -eq $keys -or @($keys).Count -eq 0) {
    Write-Host "❌ No keys found in Key Vault" -ForegroundColor Red
    exit 1
}

$cmkKey = $keys | Where-Object { $_.name -like "*cmk*" } | Select-Object -First 1

if ($null -eq $cmkKey) {
    Write-Host "⚠️  No CMK key found (looking for key with 'cmk' in name)" -ForegroundColor Yellow
    Write-Host "   Available keys: $($keys.name -join ', ')" -ForegroundColor Gray
}
else {
    Write-Host "✅ CMK key found: $($cmkKey.name)" -ForegroundColor Green
    Write-Host "   Version: $($cmkKey.version)" -ForegroundColor Gray
    Write-Host "   Type: $($cmkKey.attributes.kty)" -ForegroundColor Gray
    Write-Host "   Enabled: $($cmkKey.attributes.enabled)" -ForegroundColor Gray
}

# Test 3: Check managed identities
Write-Host ""
Write-Host "Test 3️⃣  Checking managed identities..." -ForegroundColor Yellow

$identities = az identity list --resource-group $ResourceGroupName --output json | ConvertFrom-Json

$appIdentity = $identities | Where-Object { $_.name -like "*${ResourceGroupName}*" -or $_.name -like "*event-hub*" } | Select-Object -First 1

if ($null -eq $appIdentity) {
    Write-Host "⚠️  Managed identity not found (this may be OK if not yet assigned to App Service)" -ForegroundColor Yellow
    Write-Host "   You may need to associate the identity with your App Service" -ForegroundColor Gray
}
else {
    Write-Host "✅ Managed identity found: $($appIdentity.name)" -ForegroundColor Green
    Write-Host "   Principal ID: $($appIdentity.principalId)" -ForegroundColor Gray
    Write-Host "   Client ID: $($appIdentity.clientId)" -ForegroundColor Gray
}

# Test 4: Check RBAC assignments
Write-Host ""
Write-Host "Test 4️⃣  Checking Key Vault access permissions..." -ForegroundColor Yellow

$roleAssignments = az role assignment list --scope $keyVault.id --output json | ConvertFrom-Json

$cryptoRole = $roleAssignments | Where-Object { $_.roleDefinitionName -like "*Crypto*" }

if ($null -eq $cryptoRole) {
    Write-Host "⚠️  Key Vault Crypto User role not assigned to any identity" -ForegroundColor Yellow
}
else {
    Write-Host "✅ Key Vault Crypto User role assignments found:" -ForegroundColor Green
    foreach ($assignment in $cryptoRole) {
        Write-Host "   Principal: $($assignment.principalName ?? $assignment.principalId)" -ForegroundColor Gray
    }
}

# Summary
Write-Host ""
Write-Host "📋 Verification Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allTests = @(
    $null -ne $keyVault,
    $null -ne $cmkKey,
    $null -ne $appIdentity,
    $null -ne $cryptoRole
)

$passed = ($allTests | Where-Object { $_ -eq $true } | Measure-Object).Count
$total = $allTests.Count

Write-Host "Tests Passed: $passed/$total" -ForegroundColor Yellow

if ($passed -eq $total) {
    Write-Host "✨ All checks passed! CMK infrastructure is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Configure your App Service to use the managed identity:" -ForegroundColor Cyan
    Write-Host "  az webapp identity assign --name <APP_NAME> --resource-group $ResourceGroupName --identities $($appIdentity.id)" -ForegroundColor White
}
else {
    Write-Host "⚠️  Some checks failed or have warnings. Review above for details." -ForegroundColor Yellow
}

Write-Host ""
