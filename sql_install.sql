--uncomment these two statements if it's the first time setting up the db (be logged in as root):
--CREATE DATABASE calorie_counter;
--GRANT ALL ON calorie_counter.* TO calorie_counter@localhost IDENTIFIED BY 'rFvGyHnJi99';

CREATE TABLE users(
id INT KEY NOT NULL AUTO_INCREMENT,
username VARCHAR(64) NOT NULL UNIQUE,
calorie_budget INT,
role VARCHAR(16) NOT NULL,
password_hash VARCHAR(128) NOT NULL);

CREATE TABLE entries(
id INT KEY NOT NULL AUTO_INCREMENT,
date DATE NOT NULL,
time VARCHAR(16) NOT NULL,
text VARCHAR(128) NOT NULL,
calories INT NOT NULL,
uid INT NOT NULL,
CONSTRAINT `fk_user`
   FOREIGN KEY (uid) REFERENCES users(id)
   ON DELETE CASCADE
   ON UPDATE RESTRICT);

-- create user with name admin and password cAlorie777trackz
INSERT INTO users (username, calorie_budget, role, password_hash) VALUES (
'admin', 3000, 'admin', '$2a$06$Lv.rCuYx3gn0WrQ6uLWHS.be6ZqPZ72NyXvuJms.27G.OBfWQTPO.'
);
