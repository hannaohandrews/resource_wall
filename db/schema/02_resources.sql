DROP TABLE IF EXISTS resources CASCADE;
CREATE TABLE resources (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  resource_url URL NOT NULL
  description TEXT,
  resource_image_url URL NOT NULL,
  rating INTEGER,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
