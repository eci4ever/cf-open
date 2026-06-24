-- Two-factor and passkey plugin tables

-- Add two_factor_enabled to user table
ALTER TABLE user ADD COLUMN two_factor_enabled INTEGER;

-- Two-factor authentication table
CREATE TABLE two_factor (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	secret TEXT NOT NULL,
	backup_codes TEXT NOT NULL,
	verified INTEGER NOT NULL
);

-- Passkey table
CREATE TABLE passkey (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT,
	public_key TEXT NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	credential_id TEXT NOT NULL UNIQUE,
	counter INTEGER NOT NULL,
	device_type TEXT NOT NULL,
	backed_up INTEGER NOT NULL,
	transports TEXT,
	created_at INTEGER NOT NULL,
	aaguid TEXT
);
