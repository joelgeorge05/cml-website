import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('office_bearers').insert({
    name: 'John Henry',
    house_name: 'Mundankavil',
    unit: 'Thommankuth Shakha',
    contact: '7510331983',
    designation: 'Senior Advisor',
    photo_url: '/bearers/john_henry.jpeg',
    order_index: 99
  });
  console.log(error || 'Success');
}

run();
