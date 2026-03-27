import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const username = `test_${Date.now()}`;

  console.log(`Creating user: ${email} / ${username}`);

  const { data: user, error: userError } = await supabase.from('users').insert({
    email,
    password_hash: 'dummy',
    role: 'user',
    username
  }).select().single();

  if (userError) {
    console.error('User Insert Error:', userError);
    return;
  }

  console.log('User created:', user.id);

  const { data: profile, error: profileError } = await supabase.from('profiles').insert({
    user_id: user.id,
    username,
    bio: '',
    badge_type: 'none'
  }).select().single();

  if (profileError) {
    console.error('Profile Insert Error:', profileError);
  } else {
    console.log('Profile created successfully!', profile);
  }

  await supabase.from('users').delete().eq('id', user.id);
}

run();
