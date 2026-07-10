import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const dbName = "St. Augustine Church, Karimannoor";
  
  console.log(`Deleting ${dbName}...`);
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('name', dbName);

  if (error) {
    console.error(`Error deleting ${dbName}:`, error);
  } else {
    console.log(`Successfully deleted ${dbName} from Supabase DB!`);
  }
}

run();
