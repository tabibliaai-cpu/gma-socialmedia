import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

async function run() {
    const { data: posts, error } = await supabase.from('posts').select('id, caption, media_url, media_type').limit(3).order('created_at', { ascending: false });
    console.log('Posts result:', error, JSON.stringify(posts, null, 2));
}

run();
