import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise(resolve => server.close(resolve)));

test('health endpoint responds without a database query', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('state-changing API requests reject an untrusted origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' },
    body: JSON.stringify({ email: 'user@example.com', password: 'irrelevant' })
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).message, 'Request origin is not allowed.');
});
