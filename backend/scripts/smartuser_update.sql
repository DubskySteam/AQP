-- Assuming you are already connected to the database that contains the 'smartuser' schema

-- Add 'gender' and 'display_name' columns to the 'users' table in the 'smartuser' schema
ALTER TABLE smartuser.users
ADD COLUMN gender VARCHAR(6),
ADD COLUMN display_name VARCHAR(25);

