import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const dbPath = path.resolve('.local/mongodb');
await mkdir(dbPath, { recursive: true });
const mongo = await MongoMemoryServer.create({
  binary: { version: '7.0.24', downloadDir: path.resolve('.local/binaries') },
  instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' },
});
console.log(`Local MongoDB ready at ${mongo.getUri()} — persistent data: ${dbPath}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  await mongo.stop({ doCleanup: false });
  process.exit(0);
});
