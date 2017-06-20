CREATE TABLE albums (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  content VARCHAR(1200) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  joined_date TIMESTAMP
);

CREATE TABLE album_reviews (
  album_id INTEGER REFERENCES albums (id) NOT NULL,
  review_id INTEGER REFERENCES reviews (id) NOT NULL
);

CREATE TABLE user_reviews (
  user_id INTEGER REFERENCES users (id) NOT NULL,
  review_id INTEGER REFERENCES reviews (id) NOT NULL
);


CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
	sess json NOT NULL,
	expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE session ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;