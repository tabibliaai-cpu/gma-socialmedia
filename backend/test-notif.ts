import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('notifications').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    type: 'follow',
    title: 'Test Follow',
    data: {}
  }).select();
  
  console.log('Error:', error);
  console.log('Data:', data);
}
test().then(() => process.exit(0)).catch(() => process.exit(1));
