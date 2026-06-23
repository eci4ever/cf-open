-- Admin plugin: add fields to user table
ALTER TABLE user ADD COLUMN role TEXT;
ALTER TABLE user ADD COLUMN banned INTEGER;
ALTER TABLE user ADD COLUMN ban_reason TEXT;
ALTER TABLE user ADD COLUMN ban_expires INTEGER;

-- Admin + Organization plugin: add fields to session table
ALTER TABLE session ADD COLUMN impersonated_by TEXT;
ALTER TABLE session ADD COLUMN active_organization_id TEXT;
ALTER TABLE session ADD COLUMN active_team_id TEXT;

-- Organization plugin: create tables
CREATE TABLE organization (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	logo TEXT,
	metadata TEXT,
	created_at INTEGER NOT NULL
);

CREATE TABLE member (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
	role TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE TABLE invitation (
	id TEXT PRIMARY KEY NOT NULL,
	email TEXT NOT NULL,
	inviter_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
	role TEXT,
	status TEXT NOT NULL,
	team_id TEXT,
	created_at INTEGER NOT NULL,
	expires_at INTEGER NOT NULL
);

CREATE TABLE team (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	updated_at INTEGER
);

CREATE TABLE team_member (
	id TEXT PRIMARY KEY NOT NULL,
	team_id TEXT NOT NULL REFERENCES team(id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	created_at INTEGER
);
