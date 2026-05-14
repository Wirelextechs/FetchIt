const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lfkckxzgjqxguwwjwzyu:$Hydrogen5@fetchit@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public';
  `);
  console.log(res.rows);
  
  const invalidGigs = await client.query(`
    SELECT id, user_id FROM public.gigs
    WHERE user_id NOT IN (SELECT id FROM auth.users);
  `);
  console.log('Invalid gigs:', invalidGigs.rows);

  await client.end();
}
run();
