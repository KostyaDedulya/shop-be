create table products (
	id uuid primary key default uuid_generate_v4(),
	title text,
	description text,
	price integer
)

create table stocks (
	product_id uuid,
	count integer,
	foreign key ("product_id") references "products" ("id")
)

with product as (
  insert into products (title, description, price) values
    ('Bentley', 'Bentley', 24),
    ('Ferrari', 'Ferrari', 34),
    ('Rolls Royce', 'Rolls Royce', 50),
    ('BMW', 'BMW', 10),
    ('Mercedes', 'Mercedes', 11),
    ('Audi', 'Audi', 9),
    ('Pagani', 'Pagani', 65),
    ('Bugatti', 'Bugatti', 58);
)

insert into stocks (product_id, count) values
	((select product.id from product where product.title = 'Bentley'), 10),
	((select product.id from product where product.title = 'Ferrari'), 6),
	((select product.id from product where product.title = 'Rolls Royce'), 7),
	((select product.id from product where product.title = 'BMW'), 22),
	((select product.id from product where product.title = 'Mercedes'), 20),
	((select product.id from product where product.title = 'Audi'), 30),
	((select product.id from product where product.title = 'Pagani'), 2),
	((select product.id from product where product.title = 'Bugatti'), 4);
