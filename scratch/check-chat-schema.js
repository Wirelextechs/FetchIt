const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const tables = ['chat_sessions', 'chat_wallets', 'messages'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}' AND table_schema = 'public';
    `);
    console.log(`Schema for ${table}:`, res.rows);
  }
  await client.end();
}
run();
