# Troubleshooting Guide

**Version**: 2.0  
**Last Updated**: January 12, 2026

Comprehensive troubleshooting for common issues in MSR Event Hub platform including the gateway (msr-event-agent-bridge) and backend (msr-event-agent-chat).

---

## 🔍 Gateway Issues (msr-event-agent-bridge)

### Authentication & Authorization

#### 401 Unauthorized - Invalid Token

**Symptom**: API returns `401 Unauthorized` error

**Possible Causes**:
- Expired JWT token
- Invalid token signature
- Token not in `Authorization: Bearer` header
- Whitespace issues in header

**Solutions**:

1. **Check Token Expiration**
   ```bash
   # Decode JWT (online at jwt.io or use CLI)
   jwt decode YOUR_TOKEN
   # Look for "exp" field - compare to current Unix timestamp
   date +%s  # Current time
   ```

2. **Validate Header Format**
   ```bash
   # ❌ WRONG:
   curl -H "Authorization: TOKEN_WITHOUT_BEARER" ...
   
   # ❌ WRONG:
   curl -H "Authorization: Bearer TOKEN_WITH_EXTRA_SPACES " ...
   
   # ✓ CORRECT:
   curl -H "Authorization: Bearer YOUR_TOKEN" ...
   ```

3. **Get New Token**
   ```bash
   curl -X POST http://localhost:3000/auth/token \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "securepassword"
     }'
   ```

4. **Check Token in Local Storage** (Browser/React)
   ```javascript
   // Open browser console
   localStorage.getItem('auth_token')
   // If empty or "null", user not logged in
   ```

---

#### 403 Forbidden - Insufficient Permissions

**Symptom**: API returns `403 Forbidden` error

**Possible Causes**:
- User lacks required role
- Trying to edit/delete resource not owned
- Role not properly assigned

**Solutions**:

1. **Check User Roles**
   ```bash
   # Decode JWT and check "roles" claim
   jwt decode YOUR_TOKEN | grep roles
   # Should show: "roles": ["user", "presenter"]
   ```

2. **Verify Endpoint Requirements**
   
   Consult [RBAC Matrix](RBAC_MATRIX.md) for which role is needed:
   
   | Endpoint | Required Role |
   | -------- | ------------- |
   | `POST /v1/events` | organizer |
   | `POST /v1/projects/{id}` | presenter |
   | `PATCH /v1/knowledge/{id}/status` | reviewer |
   | `DELETE /v1/projects/{id}` | organizer |

3. **Get Role Assigned** (Admin)
   ```bash
   # Admin assigns "presenter" role to user
   curl -X POST http://localhost:3000/v1/admin/users/{userId}/roles \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "roles": ["user", "presenter"]
     }'
   ```

4. **Check Resource Ownership**
   ```bash
   # Get project details
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/projects/proj_001
   
   # In response, look for "owner" or "team" field
   # User must be in team to edit
   ```

---

#### 400 Bad Request - Malformed Token

**Symptom**: Error message: `Invalid token format`

**Possible Causes**:
- Token is corrupted
- Token from different service
- JWT parsing failure

**Solutions**:

1. **Validate Token Structure**
   ```bash
   # JWT format: header.payload.signature (3 parts separated by dots)
   echo $TOKEN | tr '.' '\n' | wc -l  # Should output "3"
   ```

2. **Re-authenticate**
   ```bash
   # Get new token
   curl -X POST http://localhost:3000/auth/token \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password"
     }' | jq -r '.access_token' > token.txt
   ```

3. **Test Token Immediately**
   ```bash
   TOKEN=$(cat token.txt)
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/events
   ```

---

### Network & Connectivity

#### Connection Refused

**Symptom**: `connect ECONNREFUSED 127.0.0.1:3000`

**Possible Causes**:
- Gateway not running
- Port 3000 in use by other service
- Firewall blocking connection

**Solutions**:

1. **Check if Gateway is Running**
   ```bash
   # On Windows
   netstat -ano | findstr :3000
   
   # On macOS/Linux
   lsof -i :3000
   ```

2. **Start Gateway**
   ```bash
   cd d:\code\msr-event-agent-bridge
   npm run dev
   # Should output: "Server running on http://localhost:3000"
   ```

3. **Check for Port Conflicts**
   ```bash
   # Kill process using port 3000
   # Windows
   taskkill /PID 12345 /F
   
   # macOS/Linux
   kill -9 12345
   ```

4. **Try Different Port**
   ```bash
   PORT=3001 npm run dev
   # Then use http://localhost:3001 for requests
   ```

---

#### Network Timeout

**Symptom**: Request hangs for 30+ seconds then fails

**Possible Causes**:
- Backend (FastAPI) not responding
- Network latency issues
- Large response being processed

**Solutions**:

1. **Check Backend Status**
   ```bash
   # Ping FastAPI backend
   curl http://localhost:5000/health
   # Should return 200 OK with status data
   ```

2. **Increase Timeout** (in client code)
   ```typescript
   // TypeScript/Node.js
   const response = await axios.get(url, {
     timeout: 60000  // 60 seconds
   });
   ```

3. **Check Network**
   ```bash
   # Test connectivity to backend
   ping localhost
   
   # On Windows network issues
   ipconfig /all
   
   # Check DNS resolution
   nslookup api.eventhub.internal.microsoft.com
   ```

---

### Data Issues

#### 404 Not Found - Resource Missing

**Symptom**: API returns `404 Not Found` for existing resource

**Possible Causes**:
- Resource ID typo
- Resource deleted
- Resource in different event

**Solutions**:

1. **Verify Resource ID**
   ```bash
   # List resources and check ID
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/events
   # Copy exact ID from response
   ```

2. **Check Resource Deletion**
   ```bash
   # Try to get resource
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/projects/proj_001 \
     -v  # verbose to see status code
   # If 404, resource doesn't exist
   ```

3. **Verify Event Association**
   ```bash
   # Some resources are scoped to events
   # Correct URL: /v1/events/{eventId}/sessions/{id}
   # Not: /v1/sessions/{id}
   ```

---

#### 409 Conflict - State Mismatch

**Symptom**: Error message: `Cannot edit published project` or `Duplicate entry`

**Possible Causes**:
- Trying to edit resource in wrong state
- Resource already exists with same value
- Concurrent modification

**Solutions**:

1. **Check Resource State**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/v1/projects/proj_001
   # Look at "status" field: draft, submitted, approved, published, archived
   ```

2. **Only Edit Draft Resources**
   ```
   Can only edit: draft → submitted → approved → published
   Cannot modify: published, archived
   ```

3. **Check for Duplicates**
   ```bash
   # Before creating, search for existing
   curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/v1/projects?filter=title eq 'My Project'"
   ```

---

#### Rate Limiting - 429 Too Many Requests

**Symptom**: API returns `429` after many rapid requests

**Solutions**:

1. **Implement Backoff**
   ```typescript
   // Exponential backoff
   async function retryRequest(url, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(url);
       } catch (err) {
         if (err.status !== 429) throw err;
         const waitTime = Math.pow(2, i) * 1000;
         await new Promise(r => setTimeout(r, waitTime));
       }
     }
   }
   ```

2. **Add Delays Between Requests**
   ```bash
   for i in {1..100}; do
     curl ... api.endpoint ...
     sleep 0.1  # 100ms between requests
   done
   ```

---

### CMK (Key Vault) Issues

#### Key Vault Service Initialization Failed

**Symptom**: Error message: `KeyVaultService not initialized` or `Failed to connect to Key Vault`

**Possible Causes**:
- CMK disabled but trying to use
- Key Vault credentials invalid
- Key Vault URL malformed
- Network connectivity to Key Vault

**Solutions**:

1. **Check CMK Status**
   ```bash
   curl http://localhost:3000/health | jq '.keyvault'
   # Should show: { "status": "healthy", "isInitialized": true }
   ```

2. **Verify Environment Variables**
   ```bash
   # Check .env file
   cat .env | grep KEY_VAULT
   # Should have: KEY_VAULT_URL, ENCRYPTION_KEY_NAME, CMK_ENABLED=true
   ```

3. **Test Key Vault Access**
   ```bash
   # If using managed identity, verify it has permissions
   az identity show --resource-group mygroup --name my-managed-identity
   
   # If using connection string, verify it's valid
   az keyvault show --name my-keyvault
   ```

4. **Check Network to Key Vault**
   ```bash
   # Verify Azure connectivity
   curl https://my-vault.vault.azure.net/
   # Should return 401 (unauthorized but reachable)
   ```

---

#### Encryption/Decryption Failure

**Symptom**: Error message: `Failed to encrypt data` or `Failed to decrypt data`

**Possible Causes**:
- CMK key not found
- Key rotation in progress
- Corrupted encrypted data
- Permission issues

**Solutions**:

1. **Verify CMK Key Exists**
   ```bash
   # List keys in Key Vault
   az keyvault key list --vault-name my-vault
   # Should see encryption key
   ```

2. **Check Key Permissions**
   ```bash
   # Verify managed identity has access
   az keyvault set-policy \
     --name my-vault \
     --object-id <managed-identity-id> \
     --key-permissions encrypt decrypt wrapKey unwrapKey
   ```

3. **Disable CMK for Debugging**
   ```bash
   # Set in .env
   CMK_ENABLED=false
   
   # Restart gateway
   npm run dev
   ```

---

## 🔍 Backend Issues (msr-event-agent-chat)

### Python Environment

#### ModuleNotFoundError - Missing Dependency

**Symptom**: `ModuleNotFoundError: No module named 'fastapi'`

**Possible Causes**:
- Dependencies not installed
- Wrong Python environment
- Virtual environment not activated

**Solutions**:

1. **Install Dependencies**
   ```bash
   cd d:\code\msr-event-agent-hub
   pip install -r requirements.txt
   ```

2. **Activate Virtual Environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Check Python Version**
   ```bash
   python --version
   # Should be 3.10+ (check requirements.txt for minimum)
   ```

4. **Reinstall in Clean Environment**
   ```bash
   # Remove old environment
   rm -rf venv
   
   # Create new
   python -m venv venv
   venv\Scripts\activate
   
   # Install
   pip install -r requirements.txt
   ```

---

#### Port Already in Use

**Symptom**: `OSError: [Errno 48] Address already in use`

**Solutions**:

1. **Find Process Using Port**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # macOS/Linux
   lsof -i :5000
   ```

2. **Kill Process**
   ```bash
   # Windows
   taskkill /PID 12345 /F
   
   # macOS/Linux
   kill -9 12345
   ```

3. **Use Different Port**
   ```bash
   # FastAPI with custom port
   uvicorn main:app --host 0.0.0.0 --port 5001
   ```

---

### Database Connectivity

#### PostgreSQL Connection Failed

**Symptom**: `psycopg2.OperationalError: could not connect to server`

**Possible Causes**:
- PostgreSQL not running
- Credentials wrong
- Database doesn't exist
- Network issues

**Solutions**:

1. **Check PostgreSQL Status**
   ```bash
   # Windows
   Get-Service postgresql-*
   
   # macOS (with Homebrew)
   brew services list
   
   # Docker
   docker ps | grep postgres
   ```

2. **Start PostgreSQL**
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # macOS
   brew services start postgresql
   
   # Docker
   docker run -d -p 5432:5432 postgres:latest
   ```

3. **Verify Connection String**
   ```bash
   # In .env, check DATABASE_URL
   # Format: postgresql://user:password@localhost:5432/dbname
   
   # Test connection
   psql postgresql://user:password@localhost:5432/dbname
   ```

4. **Create Missing Database**
   ```bash
   # Connect as superuser
   psql -U postgres -h localhost
   
   # Create database
   CREATE DATABASE event_hub;
   
   # Exit and verify
   psql event_hub
   ```

---

#### Neo4j Connection Failed

**Symptom**: `neo4j.exceptions.ServiceUnavailable: Unable to connect to localhost:7687`

**Possible Causes**:
- Neo4j not running
- Port mismatch
- Authentication failed

**Solutions**:

1. **Check Neo4j Status**
   ```bash
   # Docker
   docker ps | grep neo4j
   
   # Desktop application
   # Open Neo4j Desktop and check status
   ```

2. **Start Neo4j**
   ```bash
   # Docker
   docker run -d -p 7687:7687 -p 7474:7474 \
     -e NEO4J_AUTH=neo4j/password \
     neo4j:latest
   ```

3. **Verify Credentials**
   ```bash
   # In .env, check NEO4J_URI and NEO4J_PASSWORD
   # Try connecting with cypher-shell
   cypher-shell -a bolt://localhost:7687 -u neo4j -p password
   ```

---

#### Redis Connection Failed

**Symptom**: `ConnectionError: Error -1 connecting to localhost:6379`

**Possible Causes**:
- Redis not running
- Port incorrect
- Network issue

**Solutions**:

1. **Start Redis**
   ```bash
   # Docker
   docker run -d -p 6379:6379 redis:latest
   
   # Windows (with WSL)
   wsl redis-server
   ```

2. **Test Connection**
   ```bash
   # Using redis-cli
   redis-cli ping
   # Should return: PONG
   ```

---

### Async Jobs (Celery)

#### Task Stuck or Never Completes

**Symptom**: Knowledge extraction job stays in `extracting` state indefinitely

**Possible Causes**:
- Celery worker not running
- Agent execution error
- Task queue full

**Solutions**:

1. **Check Celery Worker**
   ```bash
   # In backend directory
   celery -A app.celery_app worker --loglevel=info
   # Should show "Ready to accept tasks"
   ```

2. **Check Task Queue**
   ```bash
   # Python code
   from celery import current_app
   inspector = current_app.control.inspect()
   active = inspector.active()
   print(active)  # Shows active tasks
   ```

3. **Monitor Task Status**
   ```python
   from app.tasks import extract_knowledge
   
   result = extract_knowledge.delay(artifact_id)
   print(result.status)  # PENDING, STARTED, SUCCESS, FAILURE
   
   # Wait for result
   try:
     artifact = result.get(timeout=60)
   except Exception as e:
     print(f"Task failed: {e}")
   ```

4. **Increase Timeout**
   ```bash
   # For long-running extraction
   # In FastAPI route
   result = task.apply_async(
     args=[],
     time_limit=600,  # 10 minutes
     soft_time_limit=590
   )
   ```

---

### LLM Integration

#### OpenAI API Errors

**Symptom**: `openai.error.APIError` or `HTTP 429` from OpenAI

**Possible Causes**:
- Invalid API key
- Rate limit exceeded
- Quota exceeded
- Model not available

**Solutions**:

1. **Verify API Key**
   ```bash
   # In .env, check OPENAI_API_KEY or AZURE_OPENAI_KEY
   
   # Test with curl (OpenAI)
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Check Rate Limits**
   ```python
   # Implement exponential backoff
   import tenacity
   
   @tenacity.retry(
     wait=tenacity.wait_exponential(multiplier=1, min=2, max=10),
     stop=tenacity.stop_after_attempt(3)
   )
   async def call_openai(prompt):
     return await client.chat.completions.create(...)
   ```

3. **Monitor Quota**
   ```bash
   # OpenAI: Check usage at https://platform.openai.com/usage
   # Azure: Check in Azure Portal > OpenAI resource > Quota
   ```

4. **Add Fallback Model**
   ```python
   # If primary fails, use secondary
   models = ["gpt-4", "gpt-3.5-turbo"]
   for model in models:
     try:
       response = client.chat.completions.create(model=model, ...)
       break
     except:
       continue
   ```

---

#### LLM Agent Extraction Failures

**Symptom**: Knowledge extraction returns empty results or incorrect parsing

**Possible Causes**:
- Source document format unsupported
- Agent prompt not matching content
- Model output parsing error
- Insufficient context window

**Solutions**:

1. **Check Source Document**
   ```python
   # Verify PDF/content was properly parsed
   from app.services.document_parser import parse_pdf
   
   content = parse_pdf("paper.pdf")
   print(f"Extracted {len(content)} characters")
   # Should have significant content
   ```

2. **Test Agent with Debug Output**
   ```python
   # Enable verbose logging
   import logging
   logging.basicConfig(level=logging.DEBUG)
   
   # Run extraction with debug
   result = await paper_agent.extract(content, debug=True)
   # Check logs for prompt and response
   ```

3. **Verify Prompt Quality**
   ```python
   # Check agent prompts in app/agents/paper_agent.py
   # Test manually with LLM
   
   prompt = """
   Extract claims from this research paper:
   {paper_content}
   """
   # Run through ChatGPT playground
   ```

4. **Check Token Limits**
   ```python
   # GPT-4: 8K or 32K tokens
   # GPT-3.5: 4K tokens
   
   token_count = len(content) // 4  # rough estimate
   if token_count > 7000:
     # Truncate or summarize first
     content = content[:30000]  # characters
   ```

---

### API Issues

#### CORS Errors in Frontend

**Symptom**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Possible Causes**:
- Backend not configured for frontend origin
- Frontend URL not in CORS whitelist
- Credentials not sent with request

**Solutions**:

1. **Check CORS Configuration**
   ```python
   # In app/main.py, verify CORS setup
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:3000", "https://example.com"],
     allow_methods=["*"],
     allow_headers=["*"],
     allow_credentials=True
   )
   ```

2. **Include Credentials**
   ```typescript
   // In frontend fetch
   const response = await fetch(url, {
     credentials: 'include',  // Important!
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

3. **Check Preflight Requests**
   ```bash
   # Browser sends OPTIONS request first
   # Verify server responds 200 OK
   curl -X OPTIONS \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     http://localhost:5000/v1/chat \
     -v
   ```

---

#### Response Too Large or Slow

**Symptom**: Frontend loads very slowly or times out

**Possible Causes**:
- Large payload in response
- Complex query causing slow database operation
- Missing indexes

**Solutions**:

1. **Implement Pagination**
   ```bash
   # Instead of GET /v1/projects
   # Use: GET /v1/projects?$skip=0&$top=20
   ```

2. **Add Database Indexes**
   ```sql
   -- PostgreSQL
   CREATE INDEX idx_projects_event ON projects(event_id);
   CREATE INDEX idx_artifacts_project ON artifacts(project_id);
   ```

3. **Monitor Query Performance**
   ```python
   # Add query logging
   from sqlalchemy import event
   
   @event.listens_for(Engine, "before_cursor_execute")
   def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
     print(f"Executing: {statement}")
   ```

4. **Optimize Response**
   ```python
   # Only return needed fields
   @app.get("/projects")
   async def list_projects(skip: int = 0, top: int = 20):
     return db.query(Project).select(
       Project.id, Project.title, Project.status
     ).offset(skip).limit(top)
   ```

---

## 🧪 Quick Diagnostics

### Health Check

```bash
# Gateway health
curl http://localhost:3000/health

# Backend health
curl http://localhost:5000/health

# Both should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "timestamp": "2025-01-12T17:00:00Z"
# }
```

### Readiness Check

```bash
# Check if service is ready to accept traffic
curl http://localhost:3000/ready
curl http://localhost:5000/ready

# Returns 200 OK when ready, 503 when not
```

### Full System Diagnostic

```bash
#!/bin/bash
# Save as diagnose.sh

echo "=== Gateway Status ==="
curl -s http://localhost:3000/health | jq .

echo -e "\n=== Backend Status ==="
curl -s http://localhost:5000/health | jq .

echo -e "\n=== Database Connection ==="
psql -U postgres -h localhost -d event_hub -c "SELECT 1;"

echo -e "\n=== Neo4j Status ==="
cypher-shell "MATCH (n) RETURN count(n)"

echo -e "\n=== Redis Status ==="
redis-cli ping

echo -e "\n=== Celery Workers ==="
celery -A app.celery_app inspect active

echo -e "\n=== OpenAI Connection ==="
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.object'
```

---

## 📞 Getting Help

1. **Check Logs**
   ```bash
   # Gateway logs
   tail -f logs/gateway.log | grep ERROR
   
   # Backend logs
   tail -f logs/backend.log | grep ERROR
   ```

2. **Enable Debug Mode**
   ```bash
   # Environment variable
   DEBUG=true npm run dev
   LOG_LEVEL=debug python -m uvicorn ...
   ```

3. **Check Correlation IDs**
   - Every API error includes `correlationId`
   - Use this to find detailed logs:
   ```bash
   grep "correlationId: abc-123" logs/all.log
   ```

4. **Community Resources**
   - [API Reference](API_REFERENCE.md)
   - [RBAC Matrix](RBAC_MATRIX.md)
   - [Architecture](ARCHITECTURE.md)

---

**Last Updated**: January 12, 2026  
**Version**: 2.0  
**Status**: Production Ready
