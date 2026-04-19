drop table products;
drop table categories;

-- 1. Tạo bảng danh mục linh kiện
CREATE TABLE categories (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(255) NOT NULL
);

-- 2. Tạo bảng linh kiện PC
CREATE TABLE products (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(255) NOT NULL,
    price NUMBER(15, 2) NOT NULL,
    stock NUMBER DEFAULT 0,
    category_id NUMBER,
    product_image VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (name) VALUES ('CPU');
INSERT INTO categories (name) VALUES ('VGA');
INSERT INTO categories (name) VALUES ('RAM');
INSERT INTO categories (name) VALUES ('Monitor');
INSERT INTO categories (name) VALUES ('Keyboard');
INSERT INTO categories (name) VALUES ('Mouse');
INSERT INTO categories (name) VALUES ('Headset');

-- Trước hết, hãy đảm bảo bảng categories đã có đủ 7 ID từ 1 đến 7 nhé Nguyên.
-- Chèn 20 sản phẩm trực tiếp vào bảng products

-- 1. Xóa sạch bảng sản phẩm để nhập mới cho đẹp (tùy chọn)
-- TRUNCATE TABLE products;

-- 2. Nhập từng dòng (Cách này chậm hơn tí nhưng cực kỳ chắc chắn)
-- 1. Làm sạch bảng trước khi nhập (Nếu bạn muốn thay thế hoàn toàn dữ liệu cũ)
-- TRUNCATE TABLE products;

-- 2. Nhập 20 sản phẩm duy nhất (Đã lọc trùng từ danh sách bạn gửi)
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('CPU AMD Ryzen 7 7800X3D (Tray)', 9290000, 15, 1, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/p/cpu-amd-ryzen-7-7800x3d_1__1.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('CPU Intel Core i7 14700K', 12290000, 8, 1, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/p/cpu-intel-core-i7-14700k_1_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('CPU AMD Ryzen 7 9800X3D (WOF)', 13990000, 5, 1, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/p/cpu-amd-ryzen-7-9800x3d_1_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('VGA MSI GeForce RTX 5060 8GB VENTUS 2X OC', 10690000, 10, 2, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_2__10_44.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('VGA ASUS Dual Geforce RTX 3060 OC 12GB', 9490000, 6, 2, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/v/g/vga-asus-dual-geforce-rtx-3060-oc-12gb-dual-rtx3060_1_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('VGA Gigabyte Radeon RX 6500 XT Eagle 4GB', 5190000, 20, 2, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_839_3_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('RAM Laptop Kingston 1.2V 8GB 3200MHz', 2490000, 50, 3, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/_/d_p.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('RAM Laptop Transcend DDR5 4800MHz 16GB', 6490000, 12, 3, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/a/ram-transcend-ddr5-4800mhz-16gb_1_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('RAM PC ADATA XPG D50 RGB 16GB 3200MHz', 4290000, 25, 3, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:0:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/r/productgallery215_2.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Màn hình Gaming ASUS TUF VG27AQ5A 27 inch', 4990000, 15, 4, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_180_1_13.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Màn hình Gaming LG UltraGear 27G411A-B', 2790000, 7, 4, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_895_1_.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Màn hình Xiaomi A27QI 2026 27 inch', 3790000, 10, 4, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_179_6_60.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Bàn phím cơ E-Dra EK375W Đen', 890000, 18, 5, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/a/gaming_8_-_2025-05-30t092833.530.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Bàn phím cơ không dây Aula S100 Pro', 790000, 22, 5, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/a/gaming_8_-_2025-08-06t111146.036.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Bàn phím cơ Rapoo Aesco A83 Esport', 3490000, 4, 5, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/a/gaming_8_5__2.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Chuột Bluetooth Logitech Pebble M350S', 490000, 40, 6, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/h/chuot-khong-day-bluetooth-logitech-pebble-m350s_4.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Chuột Gaming không dây Logitech G304', 725000, 15, 6, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/h/chuot-gaming-khong-day-logitech-g304-lightspeed_1_1.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Chuột Gaming có dây Asus TUF M3 Gen 2', 420000, 9, 6, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/c/h/chuot-gaming-co-day-asus-tuf-m3-gen-2_1_1.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Tai Nghe Gaming Baseus Goplay 1 Plus Max', 790000, 12, 7, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/1/_/1_718_8.png');
INSERT INTO products (name, price, stock, category_id, product_image) VALUES ('Tai nghe Gaming Asus Tuf H3', 890000, 20, 7, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-gaming-asus-tuf-h3-3_1_1.jpg');

-- 3. Lưu dữ liệu
COMMIT;

-- 4. Kiểm tra kết quả
SELECT * FROM products ORDER BY id ASC;