-- WebShop demo seed: 15 categories, ~600 products (40 per category) with
-- randomized prices and stock. Safe to run against an existing DB (it appends).
-- Run once (re-running appends another batch).
--
-- Run it:
--   Local:  psql -h localhost -U postgres -d webshop -f seed.sql
--   Docker: docker compose exec -T postgres-db psql -U postgres -d webshop < seed.sql
--
-- Optional clean slate first (ONLY on a DB with no orders/carts/reviews referencing
-- products, otherwise the RESTRICT foreign keys will block it):
--   TRUNCATE "Products" RESTART IDENTITY CASCADE;
--   TRUNCATE "Categories" RESTART IDENTITY CASCADE;

WITH cats(name, descr, noun) AS (
    VALUES
        ('Electronics',       'Phones, computers and gadgets',        'Gadget'),
        ('Computers',         'Laptops, desktops and components',     'Laptop'),
        ('Mobile Phones',     'Smartphones and accessories',          'Phone'),
        ('Books',             'Fiction, non-fiction and textbooks',   'Book'),
        ('Clothing',          'Apparel for men, women and kids',      'Shirt'),
        ('Footwear',          'Shoes, boots and sneakers',            'Shoe'),
        ('Home & Kitchen',    'Appliances and kitchenware',           'Appliance'),
        ('Furniture',         'Chairs, tables and storage',           'Chair'),
        ('Sports & Outdoors', 'Gear for training and the outdoors',   'Equipment'),
        ('Toys & Games',      'Toys, board games and puzzles',        'Toy'),
        ('Beauty & Health',   'Cosmetics and personal care',          'Cosmetic'),
        ('Groceries',         'Snacks, drinks and pantry staples',    'Snack'),
        ('Automotive',        'Car parts and accessories',            'Accessory'),
        ('Garden',            'Tools and outdoor living',             'Tool'),
        ('Office Supplies',   'Stationery and office essentials',     'Notebook')
),
inserted AS (
    INSERT INTO "Categories" ("Name", "Description")
    SELECT name, descr FROM cats
    RETURNING "Id", "Name"
)
INSERT INTO "Products" ("Name", "Description", "Price", "StockQuantity", "CategoryId")
SELECT
    (ARRAY['Premium','Classic','Deluxe','Compact','Pro','Eco','Ultra','Smart','Vintage','Essential','Modern','Portable'])
        [1 + floor(random() * 12)::int]
        || ' ' || c.noun || ' ' || g AS name,
    'High-quality ' || c.name || ' product.' AS description,
    round((random() * 490 + 10)::numeric, 2) AS price,
    floor(random() * 200)::int AS stock,
    i."Id" AS category_id
FROM cats c
JOIN inserted i ON i."Name" = c.name
CROSS JOIN generate_series(1, 40) AS g;
