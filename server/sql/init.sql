CREATE TABLE IF NOT EXISTS users (
  username TEXT NOT NULL PRIMARY KEY,
  audio_url TEXT NOT NULL,
  key_presses JSONB NOT NULL
);
