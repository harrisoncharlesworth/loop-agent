const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('Creating Supabase tables...');

  // Create chats table
  const { error: chatsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS chats (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        title text NOT NULL DEFAULT 'New Chat',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        preview text,
        message_count int DEFAULT 0
      );
    `
  });

  if (chatsError) {
    // Try direct SQL execution instead
    const { error: directChatsError } = await supabase
      .from('chats')
      .select('id')
      .limit(1);
    
    if (directChatsError && directChatsError.code === '42P01') {
      console.log('Creating chats table...');
      // Table doesn't exist, we need to create it manually
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log(`
-- Chats table
CREATE TABLE chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  preview text,
  message_count int DEFAULT 0
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tool_calls jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- RLS Policies (optional - enable if you want row-level security)
-- ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
      `);
      return;
    }
  }

  // Test if tables exist by querying them
  const { error: testChatsError } = await supabase
    .from('chats')
    .select('id')
    .limit(1);

  const { error: testMessagesError } = await supabase
    .from('messages')
    .select('id')
    .limit(1);

  if (!testChatsError && !testMessagesError) {
    console.log('✅ Tables already exist and are accessible!');
  } else {
    console.log('❌ Tables may not exist. Please create them manually in Supabase SQL Editor.');
  }
}

createTables().catch(console.error);
