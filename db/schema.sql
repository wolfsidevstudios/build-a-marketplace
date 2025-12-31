CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  location_state VARCHAR(100) NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  image_url TEXT,
  seller_name VARCHAR(100) NOT NULL,
  seller_contact VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name) VALUES 
('Electrónicos'), ('Ropa y Accesorios'), ('Hogar y Jardín'), ('Vehículos'), ('Deportes'), ('Juguetes'), ('Inmuebles')
ON CONFLICT DO NOTHING;