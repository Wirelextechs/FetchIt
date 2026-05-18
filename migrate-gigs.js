const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Run individual ALTER TABLE statements via PATCH on a dummy row trick
// Actually, the correct Supabase way is via the SQL API at /rest/v1/rpc
// But since exec_sql doesn't exist, we use the official Supabase Management REST API

const sql = [
  "ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS gig_type TEXT NOT NULL DEFAULT 'delivery';",
  "ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS pickup_landmark TEXT;",
  "ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS dropoff_landmark TEXT;",
  "ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS offered_price NUMERIC DEFAULT 0;",
  "ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS is_visible_to_all BOOLEAN NOT NULL DEFAULT false;",
].join('\n');

function request(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: SUPABASE_URL,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(opts, res => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Attempting migration via Supabase SQL endpoint...\n');

  // Try the newer /rest/v1/sql endpoint (Supabase added this in recent versions)
  const res = await request('/rest/v1/sql', 'POST', { query: sql });
  console.log('Status:', res.status);
  console.log('Body:', res.body);

  if (res.status === 404) {
    console.log('\n/rest/v1/sql not available. Trying individual column inserts as workaround...');
    // As a workaround, we can use PostgREST's upsert to probe the schema
    // The real fix is to add columns via Supabase Dashboard SQL Editor
    console.log('\n=== MANUAL ACTION REQUIRED ===');
    console.log('Please open your Supabase Dashboard SQL Editor and run:\n');
    console.log(sql);
    console.log('\nURL: https://supabase.com/dashboard/project/lfkckxzgjqxguwwjwzyu/sql/new');
  }
}

run().catch(console.error);
