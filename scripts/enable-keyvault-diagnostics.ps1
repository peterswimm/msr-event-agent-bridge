#requires -Version 7.0
<#
.SYNOPSIS
    Enable diagnostics and monitoring for Azure Key Vault
.DESCRIPTION
    Configures Key Vault diagnostics to log key operations to Azure Monitor/Log Analytics.
    This is essential for auditing CMK key usage and troubleshooting access issues.
.PARAMETER KeyVaultName
    Name of the Key Vault
.PARAMETER ResourceGroupName
    Azure resource group containing the Key Vault
.PARAMETER LogAnalyticsWorkspaceName
    Name of Log Analytics workspace (optional - will create if not specified)
.EXAMPLE
    ./enable-keyvault-diagnostics.ps1 -KeyVaultName "kv-event-hub" -ResourceGroupName "event-hub-rg"
.NOTES
    Requires Azure CLI and appropriate permissions
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$KeyVaultName,
    
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory = $false)]
    [string]$LogAnalyticsWorkspaceName = "law-${KeyVaultName}-logs"
)

$ErrorActionPreference = "Stop"

Write-Host "📊 Configuring Key Vault Diagnostics" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Get Key Vault resource ID
Write-Host "🔍 Looking up Key Vault: $KeyVaultName" -ForegroundColor Yellow

$keyVault = az keyvault show --name $KeyVaultName --resource-group $ResourceGroupName --output json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Key Vault not found: $KeyVaultName" -ForegroundColor Red
    exit 1
}

$keyVaultId = $keyVault.id
Write-Host "✅ Found Key Vault: $keyVaultId" -ForegroundColor Green
Write-Host ""

# Check or create Log Analytics Workspace
Write-Host "📦 Setting up Log Analytics Workspace: $LogAnalyticsWorkspaceName" -ForegroundColor Yellow

$workspace = az monitor log-analytics workspace show --resource-group $ResourceGroupName --workspace-name $LogAnalyticsWorkspaceName --output json 2>$null | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "   Creating Log Analytics Workspace..." -ForegroundColor Yellow
    $workspace = az monitor log-analytics workspace create `
        --resource-group $ResourceGroupName `
        --workspace-name $LogAnalyticsWorkspaceName `
        --location (az group show --name $ResourceGroupName --query location -o tsv) `
        --output json | ConvertFrom-Json
    Write-Host "✅ Log Analytics Workspace created" -ForegroundColor Green
}
else {
    Write-Host "✅ Log Analytics Workspace exists" -ForegroundColor Green
}

$workspaceId = $workspace.id

# Enable diagnostics
Write-Host ""
Write-Host "🔐 Enabling Key Vault diagnostics..." -ForegroundColor Yellow

$diagnosticsName = "kv-diagnostics-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az monitor diagnostic-settings create `
    --name $diagnosticsName `
    --resource $keyVaultId `
    --workspace $workspaceId `
    --logs '[{"category":"AuditEvent","enabled":true}]' `
    --metrics '[{"category":"AllMetrics","enabled":true}]' `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Diagnostics enabled successfully" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Could not enable diagnostics (may already be configured)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Diagnostics Configuration:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Key Vault              : $KeyVaultName" -ForegroundColor Cyan
Write-Host "Log Analytics         : $LogAnalyticsWorkspaceName" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 To view logs in Azure Portal:" -ForegroundColor Yellow
Write-Host "1. Go to Key Vault → Monitoring → Diagnostic Settings" -ForegroundColor White
Write-Host "2. Go to Log Analytics Workspace → Logs" -ForegroundColor White
Write-Host "3. Query: AuditLogs | where OperationName contains 'Encrypt' or 'Decrypt'" -ForegroundColor White
Write-Host ""

Write-Host "✨ Diagnostics configuration complete!" -ForegroundColor Green
