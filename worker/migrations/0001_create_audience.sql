CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK(channel IN ('email','whatsapp')),
  contact TEXT NOT NULL,
  normalized_contact TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','unsubscribed')),
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  unsubscribed_at TEXT,
  UNIQUE(channel, normalized_contact)
);
CREATE INDEX IF NOT EXISTS idx_subscribers_status_created ON subscribers(status, created_at);
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL CHECK(event_name IN ('page_view','chat_open','chat_message','whatsapp_click')),
  category TEXT,
  page_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
