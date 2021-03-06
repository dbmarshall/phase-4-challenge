CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) UNIQUE NOT NULL,
  artist VARCHAR(255) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_joined TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  content VARCHAR(1200) NOT NULL,
  date_created TIMESTAMP,
	author_id INTEGER REFERENCES users (id) NOT NULL,
	album_id INTEGER REFERENCES albums (id) NOT NULL
);

CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
	sess json NOT NULL,
	expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE session ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;