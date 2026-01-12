/**
 * Helper script to generate JWT tokens for testing
 * Usage: npm run test:token -- --user "test@example.com" --roles "user,admin"
 */

import jwt from 'jsonwebtoken';
import { parseArgs } from 'node:util';

const options = {
  user: { type: 'string', short: 'u' },
  roles: { type: 'string', short: 'r' },
  scopes: { type: 'string', short: 's' },
  expires: { type: 'string', short: 'e' }
};

const { values } = parseArgs({ options });

const secret = process.env.JWT_SECRET || 'test-secret-key';
const issuer = process.env.JWT_ISSUER || 'https://eventhub.internal.microsoft.com';
const audience = process.env.JWT_AUDIENCE || 'event-hub-apps';

const user = values.user || 'test@example.com';
const roles = (values.roles || 'user').split(',').map(r => r.trim());
const scopes = (values.scopes || 'read,write').split(',').map(s => s.trim());
const expiresIn = values.expires || '24h';

const token = jwt.sign(
  {
    sub: `user-${Date.now()}`,
    email: user,
    name: user.split('@')[0],
    roles,
    scopes,
    iat: Math.floor(Date.now() / 1000)
  },
  secret,
  {
    issuer,
    audience,
    expiresIn
  }
);

console.log('\n📝 Generated JWT Token:\n');
console.log(token);
console.log('\n\nTo use with curl:\n');
console.log(`curl -H "Authorization: Bearer ${token}" \\`);
console.log(`  http://localhost:3000/v1/events\n`);

const decoded = jwt.decode(token, { complete: true });
console.log('\n📋 Token Details:\n');
console.log(JSON.stringify(decoded, null, 2));
