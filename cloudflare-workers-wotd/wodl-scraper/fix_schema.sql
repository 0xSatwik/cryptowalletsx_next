CREATE TABLE IF NOT EXISTS wodl_data_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publish_date TEXT NOT NULL,
    theme TEXT NOT NULL,
    word_length INTEGER NOT NULL,
    words TEXT NOT NULL, -- JSON array of words
    correct_answers TEXT, -- JSON array of highlighted words
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(publish_date, theme, word_length)
);

INSERT INTO wodl_data_new (id, publish_date, theme, word_length, words, created_at)
SELECT id, publish_date, theme, word_length, words, created_at FROM wodl_data;

DROP TABLE wodl_data;

ALTER TABLE wodl_data_new RENAME TO wodl_data;
