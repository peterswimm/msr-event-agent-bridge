# Production Deployment Runbook

**Version**: 2.0  
**Last Updated**: January 12, 2026  
**Audience**: DevOps, Site Reliability Engineers, Operations

Complete guide for deploying, scaling, monitoring, and maintaining MSR Event Hub in production.

---

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Azure subscription with appropriate permissions
- [ ] Resource group created
- [ ] Storage account for logs and backups
- [ ] Application Insights instance
- [ ] Log Analytics workspace
- [ ] Azure Key Vault configured with CMK
- [ ] Azure Container Registry (for Docker images)
- [ ] Database (PostgreSQL, Neo4j) provisioned
- [ ] Redis cache instance
- [ ] VNet and subnets configured (if required)

### Security Checklist

- [ ] SSL/TLS certificates obtained
- [ ] Key Vault access policies configured
- [ ] Managed identities created for gateway and backend
- [ ] Network security groups configured
- [ ] API rate limiting configured
- [ ] WAF rules configured (if using Application Gateway)
- [ ] CORS whitelist configured
- [ ] Audit logging enabled
- [ ] Secrets rotation policy established

### Application Checklist

- [ ] Environment variables documented
- [ ] Configuration validated in staging
- [ ] Database migrations tested
- [ ] Health check endpoints verified
- [ ] Error handling tested
- [ ] Logging configured and tested
- [ ] Load testing completed
- [ ] Backup and restore procedures tested

---

## 🚀 Deployment Steps

### Phase 1: Infrastructure Setup (Day 1)

#### 1.1 Deploy Core Infrastructure

```bash
# Navigate to infrastructure directory
cd msr-event-agent-bridge/infra

# Login to Azure
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Create resource group
az group create \
  --name event-hub-prod \
  --location eastus

# Deploy Bicep template
az deployment group create \
  --resource-group event-hub-prod \
  --template-file main.bicep \
  --parameters \
    environmentName=prod \
    location=eastus \
    keyVaultName=evhub-kv-prod \
    postgreSqlServerName=evhub-db-prod \
    redisCacheName=evhub-cache-prod

# Capture outputs
az deployment group show \
  --resource-group event-hub-prod \
  --name main \
  --query properties.outputs
```

#### 1.2 Configure Database

```bash
# Connect to PostgreSQL
psql \
  --host=evhub-db-prod.postgres.database.azure.com \
  --user=adminuser@evhub-db-prod \
  --dbname=event_hub

# Run migrations
python migrations/run_migrations.py \
  --connection-string "postgresql://user:pass@host/db" \
  --direction up

# Initialize seed data
python scripts/seed_database.py \
  --environment prod \
  --data-dir data/seeds
```

#### 1.3 Configure Key Vault & CMK

```bash
# Run CMK setup script
pwsh scripts/deploy-cmk.ps1 \
  -ResourceGroup event-hub-prod \
  -KeyVaultName evhub-kv-prod \
  -KeyName prod-encryption-key

# Verify setup
pwsh scripts/verify-cmk-setup.ps1 \
  -ResourceGroup event-hub-prod \
  -KeyVaultName evhub-kv-prod

# Enable diagnostics
pwsh scripts/enable-keyvault-diagnostics.ps1 \
  -KeyVaultName evhub-kv-prod \
  -WorkspaceName evhub-logs-prod
```

### Phase 2: Application Deployment (Day 1-2)

#### 2.1 Build Docker Images

```bash
# Gateway image
cd msr-event-agent-bridge
docker build -t evhub-gateway:latest .
docker tag evhub-gateway:latest $ACR_URL/evhub-gateway:latest
docker push $ACR_URL/evhub-gateway:latest

# Backend image
cd ../msr-event-agent-chat
docker build -t evhub-backend:latest .
docker tag evhub-backend:latest $ACR_URL/evhub-backend:latest
docker push $ACR_URL/evhub-backend:latest
```

#### 2.2 Deploy to AKS or App Service

**Option A: Azure Kubernetes Service (AKS)**

```bash
# Create AKS cluster (if not exists)
az aks create \
  --resource-group event-hub-prod \
  --name event-hub-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard

# Get credentials
az aks get-credentials \
  --resource-group event-hub-prod \
  --name event-hub-aks

# Deploy with Helm or kubectl
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/gateway-deployment.yaml
kubectl apply -f kubernetes/backend-deployment.yaml

# Verify pods running
kubectl get pods -n event-hub
```

**Option B: Azure Container Instances or App Service**

```bash
# Deploy gateway
az container create \
  --resource-group event-hub-prod \
  --name evhub-gateway \
  --image $ACR_URL/evhub-gateway:latest \
  --cpu 2 \
  --memory 2 \
  --port 3000 \
  --environment-variables \
    BACKEND_URL=http://evhub-backend:5000 \
    KEY_VAULT_URL=https://evhub-kv-prod.vault.azure.net/ \
  --registry-login-server $ACR_URL \
  --registry-username $ACR_USER \
  --registry-password $ACR_PASS

# Deploy backend
az container create \
  --resource-group event-hub-prod \
  --name evhub-backend \
  --image $ACR_URL/evhub-backend:latest \
  --cpu 2 \
  --memory 2 \
  --port 5000 \
  --environment-variables \
    DATABASE_URL="postgresql://user:pass@host/db" \
    REDIS_URL="redis://host:6379"
```

#### 2.3 Configure Load Balancer

```bash
# Create Application Gateway
az network application-gateway create \
  --name event-hub-appgw \
  --location eastus \
  --resource-group event-hub-prod \
  --vnet-name event-hub-vnet \
  --subnet appgw-subnet \
  --capacity 2 \
  --sku Standard_v2 \
  --http-settings-cookie-based-affinity Enabled

# Add backend pools
az network application-gateway address-pool create \
  --gateway-name event-hub-appgw \
  --resource-group event-hub-prod \
  --name gateway-pool \
  --servers 10.0.1.4

az network application-gateway address-pool create \
  --gateway-name event-hub-appgw \
  --resource-group event-hub-prod \
  --name backend-pool \
  --servers 10.0.1.5
```

#### 2.4 Configure SSL/TLS

```bash
# Import certificate to Key Vault
az keyvault certificate import \
  --vault-name evhub-kv-prod \
  --name prod-cert \
  --file path/to/certificate.pfx \
  --password "cert-password"

# Configure HTTPS listener
az network application-gateway http-listener create \
  --gateway-name event-hub-appgw \
  --resource-group event-hub-prod \
  --name https-listener \
  --port 443 \
  --ssl-cert prod-cert \
  --frontend-ip appGatewayFrontendIP

# Configure rules
az network application-gateway rule create \
  --gateway-name event-hub-appgw \
  --resource-group event-hub-prod \
  --name https-rule \
  --priority 100 \
  --http-listener https-listener \
  --rule-type Basic \
  --address-pool gateway-pool \
  --http-settings appGatewayBackendHttpSettings
```

### Phase 3: Monitoring & Alerting (Day 2)

#### 3.1 Configure Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app event-hub-insights \
  --resource-group event-hub-prod \
  --location eastus \
  --kind web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --resource-group event-hub-prod \
  --app event-hub-insights \
  --query instrumentationKey -o tsv)

# Set in environment
export APPINSIGHTS_INSTRUMENTATION_KEY=$INSTRUMENTATION_KEY
```

#### 3.2 Create Alerts

```bash
# High error rate alert
az monitor metrics alert create \
  --name "Event Hub - High Error Rate" \
  --resource-group event-hub-prod \
  --scopes "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/Microsoft.Insights/components/event-hub-insights" \
  --condition "avg RequestsFailed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/microsoft.insights/actionGroups/ops-team"

# High latency alert
az monitor metrics alert create \
  --name "Event Hub - High Latency" \
  --resource-group event-hub-prod \
  --scopes "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/Microsoft.Insights/components/event-hub-insights" \
  --condition "avg RequestDuration > 5000" \
  --window-size 5m \
  --evaluation-frequency 1m

# Database connection alert
az monitor metrics alert create \
  --name "Event Hub - DB Connection Failed" \
  --resource-group event-hub-prod \
  --scopes "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/Microsoft.DBforPostgreSQL/servers/evhub-db-prod" \
  --condition "avg FailedConnections > 5" \
  --window-size 5m \
  --evaluation-frequency 1m
```

#### 3.3 Configure Log Analytics

```bash
# Create workspace
az monitor log-analytics workspace create \
  --resource-group event-hub-prod \
  --workspace-name event-hub-logs

# Link Application Insights
az monitor diagnostic-settings create \
  --resource "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/Microsoft.Insights/components/event-hub-insights" \
  --name "app-insights-diagnostics" \
  --workspace "/subscriptions/{sub}/resourceGroups/event-hub-prod/providers/microsoft.operationalinsights/workspaces/event-hub-logs" \
  --logs '[{"category":"AppDependencies","enabled":true}]'
```

#### 3.4 Setup Dashboard

```bash
# Create monitoring dashboard
az portal dashboard create \
  --resource-group event-hub-prod \
  --name "Event Hub Monitoring" \
  --input-path monitoring/dashboard.json
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Monitor

```kusto
// Application Insights KQL queries

// Request rate and errors
requests
| summarize TotalRequests=count(), FailedRequests=sum(itemCount) by bin(timestamp, 5m)

// Response time by endpoint
requests
| summarize AvgDuration=avg(duration), P95=percentile(duration, 95), P99=percentile(duration, 99) by name

// Dependency performance (backend calls)
dependencies
| summarize AvgDuration=avg(duration), ErrorCount=count() by type, name

// Exceptions
exceptions
| summarize ErrorCount=count() by type, method
| order by ErrorCount desc

// Custom events (business metrics)
customEvents
| where name == "ProjectCreated" or name == "KnowledgeExtracted"
| summarize Count=count() by name, tostring(customDimensions.eventId)
```

### Log Analytics Queries

```kusto
// Application logs
AppServiceConsoleLogs
| where ResultDescription contains "ERROR"
| summarize Count=count() by ResultDescription
| order by Count desc

// API Gateway logs
AppServiceAuthenticationLogs
| where ResultCode == 401 or ResultCode == 403
| summarize Count=count() by ResultCode, ResultDescription

// Database connection issues
AzureDiagnostics
| where ResourceType == "SERVERS"
| where Category == "PostgreSQLLogs"
| where Message contains "connection"
| summarize Count=count() by Message
```

### Set Up Custom Logging

```python
# Backend (FastAPI)
from app.logging import setup_logging
from app.metrics import track_metric

setup_logging(
    log_level="INFO",
    log_format="json",
    app_insights_key=os.getenv("APPINSIGHTS_INSTRUMENTATION_KEY")
)

# Track custom events
@app.post("/v1/projects")
async def create_project(project: Project):
    track_metric("ProjectCreated", 1, {
        "eventId": project.eventId,
        "userId": request.user.id
    })
    # ... rest of handler
```

---

## 🔄 Scaling & Load Testing

### Horizontal Scaling

```bash
# Scale AKS nodes
az aks scale \
  --resource-group event-hub-prod \
  --name event-hub-aks \
  --node-count 5

# Scale container instances
az container start \
  --resource-group event-hub-prod \
  --name evhub-backend-2

# Auto-scaling (AKS)
kubectl autoscale deployment evhub-gateway \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n event-hub
```

### Load Testing

```bash
# Using Apache JMeter
jmeter -n -t tests/load-test.jmx \
  -l results.jtl \
  -Jthreads=100 \
  -Jrampup=60 \
  -Jduration=300

# Using k6
k6 run --vus 100 --duration 5m tests/load-test.js

# Results analysis
# Target: 100 req/sec sustained
# P95 latency: < 500ms
# Error rate: < 0.1%
```

---

## 🔐 Security Hardening

### Network Security

```bash
# Configure NSG (Network Security Group)
az network nsg rule create \
  --resource-group event-hub-prod \
  --nsg-name event-hub-nsg \
  --name AllowHTTPS \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes '*' \
  --source-port-ranges '*' \
  --destination-address-prefixes '*' \
  --destination-port-ranges 443

# Configure firewall rules
az keyvault network-rule add \
  --vault-name evhub-kv-prod \
  --ip-address "203.0.113.0/24"
```

### API Security

```bash
# Enable rate limiting (in gateway)
# See src/middleware/rateLimit.ts

# Configure CORS
app.use(cors({
  origin: [
    "https://app.eventhub.microsoft.com",
    "https://staging.eventhub.microsoft.com"
  ],
  credentials: true,
  maxAge: 3600
}))

# Enable HSTS
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}))
```

### Data Protection

```bash
# Enable database encryption at rest
az postgres flexible-server parameter set \
  --resource-group event-hub-prod \
  --server-name evhub-db-prod \
  --name require_secure_transport \
  --value ON

# Enable transparent data encryption
az sql server tde-key set \
  --server evhub-sql-prod \
  --resource-group event-hub-prod \
  --server-key-type AzureKeyVault \
  --kid "https://evhub-kv-prod.vault.azure.net/keys/cmk-prod/version"
```

---

## 🔄 Backup & Disaster Recovery

### Database Backups

```bash
# Enable automated backups
az postgres flexible-server backup create \
  --resource-group event-hub-prod \
  --name evhub-db-prod \
  --backup-name pre-maintenance-backup

# Configure backup policy
az postgres flexible-server parameter set \
  --resource-group event-hub-prod \
  --server-name evhub-db-prod \
  --name backup_retention_days \
  --value 35

# Test restore (monthly)
az postgres flexible-server restore \
  --source-server evhub-db-prod \
  --resource-group event-hub-prod \
  --server-name evhub-db-test \
  --restore-time $(date -u +'%Y-%m-%dT%H:%M:%SZ' -d '-7 days')
```

### Disaster Recovery Procedures

#### RTO: 1 hour | RPO: 15 minutes

```bash
# 1. Verify backup exists
az postgres flexible-server backup list \
  --resource-group event-hub-prod \
  --name evhub-db-prod \
  --query "[0]"

# 2. Create new database from backup
az postgres flexible-server restore \
  --source-server evhub-db-prod \
  --resource-group event-hub-prod \
  --server-name evhub-db-recovery \
  --restore-time "2025-01-12T16:00:00Z"

# 3. Test connectivity
psql -h evhub-db-recovery.postgres.database.azure.com \
  -U admin -d event_hub

# 4. Update connection strings in gateway/backend
# In .env or Key Vault
DATABASE_URL=postgresql://...evhub-db-recovery...

# 5. Restart services
kubectl rollout restart deployment/evhub-gateway -n event-hub
kubectl rollout restart deployment/evhub-backend -n event-hub

# 6. Run health checks
curl https://api.eventhub.microsoft.com/health
curl https://api.eventhub.microsoft.com/ready
```

---

## 📈 Capacity Planning

### Resource Allocation

| Service | CPU | Memory | Storage | Notes |
|---------|-----|--------|---------|-------|
| Gateway | 2-4 cores | 2-4 GB | 20 GB | Horizontal scalable |
| Backend | 4-8 cores | 4-8 GB | 50 GB | Handle agents |
| PostgreSQL | 4-8 cores | 16-32 GB | 500 GB | 35-day backups |
| Neo4j | 4 cores | 8 GB | 200 GB | Graph queries |
| Redis | 2 cores | 4 GB | 50 GB | Session cache |

### Growth Projections

```
Year 1 (Current):
- Events: 5-10 per month
- Projects: 500-1000
- Users: 200-500
- Storage: 50-100 GB
- Peak RPS: 100-500

Year 2:
- Events: 15-25 per month
- Projects: 5000-10000
- Users: 2000-5000
- Storage: 500 GB - 1 TB
- Peak RPS: 1000-5000
- Scale to 5+ AKS nodes
```

---

## 🛠️ Operational Procedures

### Rolling Updates

```bash
# Update gateway image
kubectl set image deployment/evhub-gateway \
  evhub-gateway=$ACR_URL/evhub-gateway:v2.0.1 \
  -n event-hub \
  --record

# Monitor rollout
kubectl rollout status deployment/evhub-gateway -n event-hub

# Rollback if needed
kubectl rollout undo deployment/evhub-gateway -n event-hub
```

### Configuration Changes

```bash
# Update ConfigMap
kubectl edit configmap event-hub-config -n event-hub

# Restart pods to pick up changes
kubectl delete pods -l app=evhub-gateway -n event-hub
# Deployment will recreate them automatically
```

### Manual Intervention

```bash
# SSH into pod for debugging
kubectl exec -it pod/evhub-gateway-xyz -n event-hub -- /bin/bash

# View pod logs
kubectl logs pod/evhub-gateway-xyz -n event-hub --follow

# Check pod events
kubectl describe pod evhub-gateway-xyz -n event-hub
```

### Maintenance Windows

**Scheduled Every Sunday 2:00-3:00 AM PST**

1. Announce in #event-hub-ops Slack channel
2. Update status page to "Maintenance"
3. Run schema migrations (if any)
4. Update dependencies
5. Run integration tests
6. Verify all health checks pass
7. Update status page to "Operational"
8. Post incident report (if any issues)

---

## 🚨 Incident Response

### High Error Rate (>5% errors)

```bash
# 1. Check Application Insights
# Look for error spike and correlation

# 2. View logs
kubectl logs -l app=evhub-gateway -n event-hub --tail=100 | grep ERROR

# 3. Check dependencies
curl https://api.openai.com/v1/models -H "Authorization: Bearer $KEY"
psql -h $DB_HOST ...
redis-cli ping

# 4. If code issue:
kubectl rollout undo deployment/evhub-gateway -n event-hub

# 5. If infrastructure:
az vm restart --resource-group event-hub-prod --name vm-name
```

### High Latency (>2 seconds P95)

```bash
# 1. Check Application Insights
# View slow requests query

# 2. Check database
EXPLAIN ANALYZE SELECT * FROM projects WHERE event_id = ...;
# Create indexes if needed

# 3. Check cache hit rate
redis-cli INFO stats | grep hit_ratio

# 4. Scale up if needed
kubectl scale deployment/evhub-backend --replicas=5 -n event-hub
```

### Database Connection Pool Exhausted

```bash
# 1. Check current connections
SELECT count(*) FROM pg_stat_activity;

# 2. Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE idle_in_transaction AND query_start < now() - interval '30 min';

# 3. Increase pool size in connection string
DATABASE_URL=postgresql://...?sslmode=require&pool_size=50

# 4. Restart services
kubectl rollout restart deployment/evhub-backend -n event-hub
```

---

## 📋 Handoff Checklist

- [ ] All health checks passing
- [ ] Monitoring and alerts configured
- [ ] Runbooks accessible to on-call team
- [ ] Incident response procedures documented
- [ ] Backups verified (restore tested)
- [ ] Load test completed (results documented)
- [ ] Security scan passed
- [ ] Documentation complete
- [ ] Team trained on operations
- [ ] SLA documented and agreed

---

## 🚀 Phase 3: Backend Data Layer Restructuring (Planned)

**Timeline**: Weeks 1-2 of next phase  
**Objective**: Establish `/data/*` CRUD endpoints, move business logic to Bridge

Separate data operations from business logic by creating a pure data layer with CRUD endpoints. Backend team implements `/data/*` endpoints, Bridge team creates handlers.

**Data Endpoints**: `GET|POST /data/projects`, `/data/events`, `/data/sessions`, `/data/artifacts`

**Success**: All endpoints tested, Bridge queries backend for all operations, integration tests pass

---

## 🌐 Phase 4: Frontend Deployment Separation (Planned)

**Timeline**: Weeks 4-5 of next phase  
**Objective**: Deploy Webchat independently to CDN, enable multi-origin deployment

Enable independent frontend/backend deployment with separate versioning (v1.x for frontend, v2.x for backend), CORS support for multiple origins, and CDN distribution.

**Key Tasks**: Set up CDN, configure CORS, create GitHub Actions pipelines, implement monitoring

**Estimated Cost**: $85-160/month (CDN $1-2, API $3-5, Compute $30-50, Database $50-100)

**Success**: Webchat on CDN, CORS working, independent pipelines, monitoring configured

---

## 📚 Related Documentation

- [Quick Start Guide](QUICK_START.md) - Local development setup
- [API Reference](API_REFERENCE.md) - API endpoint documentation
- [Architecture Guide](ARCHITECTURE.md) - System design
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common issues
- [RBAC Matrix](RBAC_MATRIX.md) - Permission reference

---

**Last Updated**: January 14, 2026  
**Version**: 2.0  
**Status**: Production Ready (Phases 1-2), Planned (Phases 3-4)

**Next Review**: January 20, 2026  
