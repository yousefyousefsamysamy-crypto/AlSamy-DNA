CREATE TABLE IF NOT EXISTS results (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT, address TEXT, started_at TEXT, completed_at TEXT, duration_s INTEGER, attempt INTEGER, percent INTEGER, band TEXT, critical INTEGER, written INTEGER, report_json TEXT NOT NULL, report_html TEXT, created_at TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS results_created ON results (created_at DESC);

CREATE INDEX IF NOT EXISTS results_phone ON results (phone, created_at DESC);
