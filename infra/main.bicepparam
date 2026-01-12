using './main.bicep'

param environment = 'dev'
param location = 'eastus'
param appName = 'event-hub-bridge'
param keySize = 2048
param cmkKeyName = 'event-hub-cmk'
param enableSoftDelete = true
param enablePurgeProtection = true
param softDeleteRetentionInDays = 90
