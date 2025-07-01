// Simple table creation script
console.log(`
🗄️  SUPABASE TABLE CREATION SCRIPT
==================================

Please copy and run this SQL in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste and execute the following SQL:

-- ===================================
-- CHAT HISTORY TABLES FOR LOOP AGENT
-- ===================================

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  preview text,
  message_count int DEFAULT 0
);

-- Messages table  
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tool_calls jsonb,
  created_at timestamptz DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Row Level Security (optional - uncomment if needed)
-- ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view own chats" ON chats
--   FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);
-- 
-- CREATE POLICY "Users can insert own chats" ON chats
--   FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);
-- 
-- CREATE POLICY "Users can update own chats" ON chats
--   FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);
-- 
-- CREATE POLICY "Users can delete own chats" ON chats
--   FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
-- 
-- CREATE POLICY "Users can view own messages" ON messages
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM chats
--       WHERE chats.id = messages.chat_id
--       AND chats.user_id = auth.jwt() ->> 'sub'
--     )
--   );
-- 
-- CREATE POLICY "Users can insert messages to own chats" ON messages
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM chats
--       WHERE chats.id = messages.chat_id
--       AND chats.user_id = auth.jwt() ->> 'sub'
--     )
--   );

-- Verify tables were created
SELECT 'chats' as table_name, count(*) as row_count FROM chats
UNION ALL
SELECT 'messages' as table_name, count(*) as row_count FROM messages;

✅ After running this SQL, your Loop Agent will have full chat history functionality!

Alternative: You can also create these tables using the Supabase CLI if you have it installed:
supabase db reset --linked
`);
