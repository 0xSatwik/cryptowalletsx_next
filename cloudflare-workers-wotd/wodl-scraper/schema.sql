CREATE TABLE IF NOT EXISTS wodl_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publish_date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
    theme TEXT NOT NULL,
    word_length INTEGER NOT NULL,
    words TEXT NOT NULL, -- JSON array of words
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publish_date, theme, word_length)
);
