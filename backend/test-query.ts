import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
  const { data: posts } = await supabase.from('posts').select('id, user_id, caption').limit(5).order('created_at', { ascending: false });
  console.log('Posts:', posts);
  
  if (posts && posts.length > 0) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', posts[0].user_id);
    console.log('Profile for first post:', profile);
  }
}

run();
