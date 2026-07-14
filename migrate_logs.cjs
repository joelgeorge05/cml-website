require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ayoqlfospgjcklucurig.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  let dbData;
  try {
    dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  } catch (e) {
    console.error("Failed to read db.json", e);
    process.exit(1);
  }

  if (!dbData.logs || !Array.isArray(dbData.logs) || dbData.logs.length === 0) {
    console.log("No logs to migrate!");
    return;
  }

  console.log(`Found ${dbData.logs.length} logs to migrate...`);

  const supabaseLogs = dbData.logs.map(log => ({
    id: log.id,
    user_email: log.userEmail || 'Anonymous',
    action: log.action,
    target: log.target || '',
    timestamp: log.timestamp || new Date().toISOString()
  }));

  const { data, error } = await supabase.from('activity_logs').upsert(supabaseLogs);
  if (error) {
    console.error("Failed to migrate logs to Supabase:", error);
  } else {
    console.log("Successfully migrated logs to Supabase!");
  }
}

run();
