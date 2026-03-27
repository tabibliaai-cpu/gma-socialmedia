import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
  console.log('Testing profile insert...');
  // Find a random user id to use
  const { data: users } = await supabase.from('users').select('id, email').limit(5);
  if (!users || users.length === 0) {
    console.log('No users found to test with.');
    return;
  }
  
  const userId = users[0].id;
  
  const { data, error } = await supabase.from('profiles').insert({
    user_id: userId,
    username: 'testuser_123',
    bio: '',
    badge_type: 'none'
  });
  
  console.log('Result:', { data, error });
}

run();
