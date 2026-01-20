#requires -Version 7.0
<#
.SYNOPSIS
    Deploy CMK infrastructure for MSR Event Hub Bridge to Azure
.DESCRIPTION
    This script deploys the Bicep template for Customer-Managed Keys infrastructure,
    including Key Vault, CMK key, and managed identity with RBAC assignments.
.PARAMETER ResourceGroupName
    Name of the Azure resource group to deploy to
.PARAMETER Location
    Azure region for resources (default: eastus)
.PARAMETER Environment
    Environment name: dev, staging, or prod (default: dev)
.PARAMETER ParameterFile
    Path to the Bicep parameters file (default: main.bicepparam)
.EXAMPLE
    ./deploy-cmk.ps1 -ResourceGroupName "event-hub-rg" -Environment "dev"
.NOTES
    Requires Azure CLI or Azure PowerShell module
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory = $false)]
    [string]$ParameterFile = "main.bicepparam"
)

$ErrorActionPreference = "Stop"

Write-Host "🔐 MSR Event Hub Bridge - CMK Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Validate prerequisites
Write-Host "📋 Validating prerequisites..." -ForegroundColor Yellow

# Check if Azure CLI is available
$azCommand = Get-Command az -ErrorAction SilentlyContinue
if ($null -eq $azCommand) {
    Write-Host "❌ Azure CLI not found. Please install it from https://aka.ms/azure-cli" -ForegroundColor Red
    exit 1
}

# Check if user is logged in
$currentUser = az account show --query "user.name" -o tsv 2>$null
if ($null -eq $currentUser) {
    Write-Host "❌ Not logged into Azure. Run 'az login' first" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logged in as: $currentUser" -ForegroundColor Green

# Check if resource group exists, create if needed
Write-Host "📦 Checking resource group: $ResourceGroupName" -ForegroundColor Yellow

$rgExists = az group exists --name $ResourceGroupName -o tsv
if ($rgExists -eq "false") {
    Write-Host "   Creating resource group in region: $Location" -ForegroundColor Yellow
    az group create --name $ResourceGroupName --location $Location --output none
    Write-Host "✅ Resource group created" -ForegroundColor Green
}
else {
    Write-Host "✅ Resource group exists" -ForegroundColor Green
}

# Validate Bicep template
Write-Host ""
Write-Host "🔍 Validating Bicep template..." -ForegroundColor Yellow

$templatePath = Join-Path $PSScriptRoot ".." "infra" "main.bicep"
$paramPath = Join-Path $PSScriptRoot ".." "infra" $ParameterFile

if (-not (Test-Path $templatePath)) {
    Write-Host "❌ Bicep template not found at: $templatePath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $paramPath)) {
    Write-Host "❌ Parameter file not found at: $paramPath" -ForegroundColor Red
    exit 1
}

# Run validation
$validationOutput = az deployment group validate `
    --resource-group $ResourceGroupName `
    --template-file $templatePath `
    --parameters $paramPath `
    --parameters environment=$Environment `
    --parameters location=$Location `
    2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Template validation failed:" -ForegroundColor Red
    Write-Host $validationOutput -ForegroundColor Red
    exit 1
}

Write-Host "✅ Template validation passed" -ForegroundColor Green

# Deploy infrastructure
Write-Host ""
Write-Host "🚀 Deploying CMK infrastructure..." -ForegroundColor Yellow
Write-Host "   Template: $templatePath" -ForegroundColor Gray
Write-Host "   Parameters: $paramPath" -ForegroundColor Gray
Write-Host "   Environment: $Environment" -ForegroundColor Gray
Write-Host ""

$deploymentName = "cmk-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$deploymentOutput = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file $templatePath `
    --parameters $paramPath `
    --parameters environment=$Environment location=$Location `
    --name $deploymentName `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment completed successfully" -ForegroundColor Green
Write-Host ""

# Extract outputs
$outputs = $deploymentOutput.properties.outputs

Write-Host "📤 Deployment Outputs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$keyVaultUri = $outputs.keyVaultUri.value
$cmkKeyName = $outputs.cmkKeyName.value
$cmkKeyVersion = $outputs.cmkKeyVersion.value
$managedIdentityId = $outputs.managedIdentityId.value
$managedIdentityClientId = $outputs.managedIdentityClientId.value
$managedIdentityPrincipalId = $outputs.managedIdentityPrincipalId.value
$keyVaultResourceId = $outputs.keyVaultResourceId.value

Write-Host "Key Vault URI              : $keyVaultUri" -ForegroundColor Cyan
Write-Host "CMK Key Name               : $cmkKeyName" -ForegroundColor Cyan
Write-Host "CMK Key Version            : $cmkKeyVersion" -ForegroundColor Cyan
Write-Host "Managed Identity ID        : $managedIdentityId" -ForegroundColor Cyan
Write-Host "Managed Identity Client ID : $managedIdentityClientId" -ForegroundColor Cyan
Write-Host "Managed Identity Principal : $managedIdentityPrincipalId" -ForegroundColor Cyan
Write-Host "Key Vault Resource ID      : $keyVaultResourceId" -ForegroundColor Cyan
Write-Host ""

# Save outputs to file for reference
$outputFile = Join-Path $PSScriptRoot "cmk-deployment-outputs.json"
$outputs | ConvertTo-Json | Set-Content $outputFile

Write-Host "💾 Full outputs saved to: $outputFile" -ForegroundColor Green
Write-Host ""

# Next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1. Save these values in your .env file:" -ForegroundColor Yellow
Write-Host "   KEY_VAULT_URL=$keyVaultUri" -ForegroundColor White
Write-Host "   ENCRYPTION_KEY_NAME=$cmkKeyName" -ForegroundColor White
Write-Host "   AZURE_CLIENT_ID=$managedIdentityClientId" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure App Service to use managed identity:" -ForegroundColor Yellow
Write-Host "   ./setup-keyvault-permissions.ps1 -ResourceGroupName $ResourceGroupName -IdentityPrincipalId $managedIdentityPrincipalId" -ForegroundColor White
Write-Host ""
Write-Host "3. Enable diagnostics (optional but recommended):" -ForegroundColor Yellow
Write-Host "   ./enable-keyvault-diagnostics.ps1 -KeyVaultName <KEY_VAULT_NAME> -ResourceGroupName $ResourceGroupName" -ForegroundColor White
Write-Host ""

Write-Host "✨ CMK infrastructure deployment complete!" -ForegroundColor Green
