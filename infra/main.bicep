metadata description = 'Customer-Managed Keys (CMK) infrastructure for MSR Event Hub Bridge'
metadata author = 'MSR Event Hub Team'

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Application name')
param appName string = 'event-hub-bridge'

@description('Key Vault name (must be globally unique)')
param keyVaultName string = 'kv-${appName}-${environment}-${uniqueString(resourceGroup().id)}'

@description('RSA key size (2048, 3072, or 4096)')
param keySize int = 2048

@description('CMK key name')
param cmkKeyName string = 'event-hub-cmk'

@description('Enable Key Vault soft delete (required for CMK)')
param enableSoftDelete bool = true

@description('Enable Key Vault purge protection (required for CMK)')
param enablePurgeProtection bool = true

@description('Days to retain soft-deleted keys')
param softDeleteRetentionInDays int = 90

@description('Managed identity name for the App Service')
param managedIdentityName string = 'mi-${appName}-${environment}'

var keyVaultRoleId = '12338af0-0e69-4776-a894-a57eca8541a3' // Key Vault Crypto User

// Key Vault resource
resource keyVault 'Microsoft.KeyVault/vaults@2024-04-01-preview' = {
  name: keyVaultName
  location: location
  properties: {
    enabledForDeployment: true
    enabledForDiskEncryption: true
    enabledForTemplateDeployment: true
    enableSoftDelete: enableSoftDelete
    softDeleteRetentionInDays: softDeleteRetentionInDays
    enablePurgeProtection: enablePurgeProtection
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
  }
}

// Create RSA key in Key Vault for encryption
resource encryptionKey 'Microsoft.KeyVault/vaults/keys@2024-04-01-preview' = {
  parent: keyVault
  name: cmkKeyName
  properties: {
    kty: 'RSA'
    keySize: keySize
    keyOps: [
      'encrypt'
      'decrypt'
      'sign'
      'verify'
      'wrapKey'
      'unwrapKey'
    ]
    attributes: {
      enabled: true
    }
  }
}

// System-assigned managed identity for App Service
resource userManagedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

// Grant Key Vault Crypto User role to managed identity via RBAC
// This allows the identity to encrypt/decrypt with the CMK key
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, userManagedIdentity.id, keyVaultRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultRoleId)
    principalId: userManagedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Outputs for downstream configuration
@description('Key Vault URI for connecting clients')
output keyVaultUri string = keyVault.properties.vaultUri

@description('CMK key name')
output cmkKeyName string = encryptionKey.name

@description('CMK key version (latest)')
output cmkKeyVersion string = encryptionKey.properties.keyUriWithVersion

@description('Managed identity resource ID')
output managedIdentityId string = userManagedIdentity.id

@description('Managed identity principal ID (for RBAC assignments)')
output managedIdentityPrincipalId string = userManagedIdentity.properties.principalId

@description('Managed identity client ID')
output managedIdentityClientId string = userManagedIdentity.properties.clientId

@description('Key Vault resource ID')
output keyVaultResourceId string = keyVault.id
