import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: bearers, error: fetchError } = await supabase.from('office_bearers').select('*').order('order_index', { ascending: true });
  
  if (fetchError) {
    console.error(fetchError);
    return;
  }
  
  let newOrder = 0;
  for (const b of bearers) {
    if (b.name === 'John Henry') {
      continue; // Skip him, we will place him specially
    }
    
    // Assign new order
    b.order_index = newOrder++;
    await supabase.from('office_bearers').update({ order_index: b.order_index }).eq('id', b.id);
    
    // After Assistant General Organizer (who just got assigned), we place John Henry
    if (b.name === 'Ann Mariya Vincent') {
      // Ann Mariya Vincent is Assistant General Organizer
      // Now insert John Henry right after her
      const john = bearers.find(x => x.name === 'John Henry');
      if (john) {
        john.order_index = newOrder++;
        await supabase.from('office_bearers').update({ order_index: john.order_index }).eq('id', john.id);
      }
    }
  }
  console.log("Updated ordering!");
}

run();
