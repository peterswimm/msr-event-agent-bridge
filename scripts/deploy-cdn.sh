#!/bin/bash
# Deploy Webchat to Azure Blob Storage + CDN (Phase 4)
# This script builds the webchat and deploys it to Azure CDN
# 
# Usage: ./deploy-cdn.sh [environment]
# Environment: dev, staging, prod (default: dev)
#
# Prerequisites:
# - Azure CLI (az) installed and authenticated
# - Environment variables set: AZURE_RESOURCE_GROUP, AZURE_STORAGE_ACCOUNT
# - CDN endpoint configured for static website hosting

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
WEBCHAT_DIR="$PROJECT_ROOT/web/chat"
BUILD_DIR="$WEBCHAT_DIR/dist"

# Azure Configuration
AZURE_RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-msr-event-${ENVIRONMENT}}"
AZURE_STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT:-msreventchat${ENVIRONMENT}}"
AZURE_STORAGE_CONTAINER="${AZURE_STORAGE_CONTAINER:-\$web}"
AZURE_CDN_ENDPOINT="${AZURE_CDN_ENDPOINT:-msr-event-chat-${ENVIRONMENT}}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    log_info "Allowed values: dev, staging, prod"
    exit 1
fi

log_info "Deploying Webchat to Azure CDN for environment: $ENVIRONMENT"

# Check prerequisites
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Please install it first."
    log_info "Visit: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Verify Azure authentication
log_info "Verifying Azure authentication..."
if ! az account show &> /dev/null; then
    log_error "Not authenticated with Azure. Please run 'az login' first."
    exit 1
fi

# Build webchat
log_info "Building webchat application..."
cd "$WEBCHAT_DIR"

if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm install
fi

# Set environment
export VITE_API_URL="https://api-${ENVIRONMENT}.msr-event.internal"
export VITE_BRIDGE_URL="https://bridge-${ENVIRONMENT}.msr-event.internal"

log_info "Building with environment: $ENVIRONMENT"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build failed. dist directory not found."
    exit 1
fi

log_info "Build completed successfully ($(du -sh "$BUILD_DIR" | cut -f1) total)"

# Deploy to Azure Blob Storage
log_info "Deploying to Azure Storage Account: $AZURE_STORAGE_ACCOUNT"

# Check if storage account exists
if ! az storage account show \
    --name "$AZURE_STORAGE_ACCOUNT" \
    --resource-group "$AZURE_RESOURCE_GROUP" &> /dev/null; then
    log_error "Storage account '$AZURE_STORAGE_ACCOUNT' not found in resource group '$AZURE_RESOURCE_GROUP'"
    exit 1
fi

# Get storage account key
STORAGE_KEY=$(az storage account keys list \
    --account-name "$AZURE_STORAGE_ACCOUNT" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --query '[0].value' -o tsv)

if [ -z "$STORAGE_KEY" ]; then
    log_error "Failed to retrieve storage account key"
    exit 1
fi

# Upload files with proper cache headers
log_info "Uploading static assets to Azure Blob Storage..."

# Upload non-HTML assets with long cache
cd "$BUILD_DIR"
for file in $(find . -type f ! -name "*.html" ! -name "*.map"); do
    relative_path="${file#./}"
    log_info "Uploading: $relative_path"
    az storage blob upload \
        --account-name "$AZURE_STORAGE_ACCOUNT" \
        --account-key "$STORAGE_KEY" \
        --container-name "$AZURE_STORAGE_CONTAINER" \
        --file "$file" \
        --name "$relative_path" \
        --cache-control "public, max-age=3600" \
        --overwrite \
        --no-progress &> /dev/null
done

# Upload HTML files with no-cache headers
log_info "Uploading HTML files (no-cache)..."
for file in $(find . -name "*.html"); do
    relative_path="${file#./}"
    az storage blob upload \
        --account-name "$AZURE_STORAGE_ACCOUNT" \
        --account-key "$STORAGE_KEY" \
        --container-name "$AZURE_STORAGE_CONTAINER" \
        --file "$file" \
        --name "$relative_path" \
        --cache-control "public, max-age=0, must-revalidate" \
        --content-type "text/html; charset=utf-8" \
        --overwrite \
        --no-progress &> /dev/null
done

log_info "Files uploaded to Azure Blob Storage"

# Purge CDN cache if endpoint exists
if az cdn endpoint show \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --profile-name "msr-event-cdn-${ENVIRONMENT}" \
    --name "$AZURE_CDN_ENDPOINT" &> /dev/null 2>&1; then
    
    log_info "Purging CDN cache for endpoint: $AZURE_CDN_ENDPOINT"
    az cdn endpoint purge \
        --resource-group "$AZURE_RESOURCE_GROUP" \
        --profile-name "msr-event-cdn-${ENVIRONMENT}" \
        --name "$AZURE_CDN_ENDPOINT" \
        --content-paths "/*"
    log_info "CDN cache purge initiated"
else
    log_warn "CDN endpoint not found. Skipping cache purge."
    log_info "To configure CDN, see: docs/DEPLOYMENT_RUNBOOK.md#azure-cdn-setup"
fi

log_info "Deployment completed successfully!"
log_info "Webchat URL: https://${AZURE_CDN_ENDPOINT}.azureedge.net/"
log_info "Storage Account: https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/\$web/"
