-- Insert test data
USE homerent;

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, full_name, username, role, email_verified) VALUES
('admin@homerent.by', '$2y$12$.Y5MPLJ9enFOPMN2V0N.8uCcIWq.wDHLhHxn/3ZQy4P1jqnc5jkNq', 'Администратор', 'admin', 'admin', TRUE);

-- Insert regular users (password: password123)
INSERT INTO users (email, password, full_name, username, phone, email_verified) VALUES
('ivan.ivanov@mail.ru', '$2y$12$2NFEbryrvFdiOazlDISySu3mmYatmnFZk9OAvUG8JjKgI97iMrkze', 'Иван Иванов', 'ivan_ivanov', '+375 (29) 123-45-67', TRUE),
('maria.petrova@gmail.com', '$2y$12$2NFEbryrvFdiOazlDISySu3mmYatmnFZk9OAvUG8JjKgI97iMrkze', 'Мария Петрова', 'maria_petrova', '+375 (29) 234-56-78', TRUE),
('alex.smirnov@yandex.by', '$2y$12$2NFEbryrvFdiOazlDISySu3mmYatmnFZk9OAvUG8JjKgI97iMrkze', 'Алексей Смирнов', 'alex_smirnov', '+375 (33) 345-67-89', TRUE),
('elena.kozlova@mail.ru', '$2y$12$2NFEbryrvFdiOazlDISySu3mmYatmnFZk9OAvUG8JjKgI97iMrkze', 'Елена Козлова', 'elena_kozlova', '+375 (25) 456-78-90', TRUE);

-- Insert properties
INSERT INTO properties (owner_id, property_type, title, description, address, city, max_guests, bedrooms, beds, bathrooms, price_per_night) VALUES
(2, 'apartment', 'Уютная квартира в центре Минска', 'Просторная двухкомнатная квартира в самом центре столицы. Идеально подходит для деловой поездки или отдыха. В шаговой доступности метро, магазины, рестораны. Квартира полностью оборудована всем необходимым для комфортного проживания. Есть все удобства: Wi-Fi, кондиционер, стиральная машина, полностью оборудованная кухня. Рядом парки и достопримечательности. Транспортная доступность отличная.', 'пр. Независимости, д. 10, кв. 25', 'Минск', 4, 2, 2, 1, 85.00),
(2, 'house', 'Загородный дом с бассейном под Минском', 'Красивый загородный дом для отдыха всей семьей. Большой участок, бассейн, баня. Дом полностью меблирован и оборудован. Идеальное место для отдыха от городской суеты. В доме есть все необходимое: современная кухня, гостиная с камином, несколько спален. На участке детская площадка, мангальная зона. Парковка для нескольких автомобилей. Тихая экологически чистая зона.', 'д. Заречье, ул. Лесная, д. 5', 'Минский район', 8, 4, 5, 3, 120.00),
(3, 'apartment', 'Современная студия в центре Минска', 'Светлая студия в новом доме. Отличное расположение рядом с проспектом Победителей. Современный ремонт, вся необходимая техника. Идеально для одного или пары. В квартире есть все для комфортного проживания: стиральная машина, микроволновка, холодильник, телевизор. Рядом множество кафе, магазинов, достопримечательностей. Транспортная доступность отличная.', 'пр. Победителей, д. 50, кв. 12', 'Минск', 2, 1, 1, 1, 65.00),
(3, 'cottage', 'Элитный коттедж на берегу озера Нарочь', 'Роскошный коттедж с видом на озеро. Большая территория, причал, сауна. Идеально для VIP-отдыха. Дом выполнен в современном стиле с использованием натуральных материалов. Большие панорамные окна, открывающие вид на озеро. В доме несколько уровней, просторные комнаты, каминный зал. На территории беседка, мангальная зона, детская площадка. Возможна аренда лодок и водного транспорта.', 'пос. Нарочь, ул. Набережная, д. 1', 'Мядельский район', 10, 5, 6, 4, 200.00),
(4, 'room', 'Комната в центре Гродно', 'Уютная комната в квартире в центре города. Рядом университеты, достопримечательности. Подходит для студентов и молодых специалистов. Комната светлая, с балконом. В квартире есть общая кухня, ванная комната. Wi-Fi, стиральная машина. Хозяева не проживают в квартире. Район тихий, безопасный. Много магазинов и кафе поблизости.', 'ул. Советская, д. 15, кв. 8', 'Гродно', 1, 1, 1, 1, 35.00),
(4, 'apartment', 'Просторная квартира в Бресте', 'Трехкомнатная квартира в новом районе. Современный ремонт, вся техника. Подходит для семьи с детьми. Квартира находится на высоком этаже с хорошим видом. В квартире есть детская комната, большая гостиная, кухня-столовая. Вся необходимая техника, игрушки для детей. Рядом детские сады, школы, парки. Развитая инфраструктура района.', 'ул. Ленина, д. 100, кв. 45', 'Брест', 6, 3, 3, 2, 90.00),
(5, 'house', 'Дом у озера в Витебске', 'Дом в 100 метрах от озера. Собственный участок, терраса с видом на воду. Идеально для летнего отдыха. Дом двухэтажный, с большой террасой и садом. Из окон открывается вид на озеро. В доме есть все необходимое для комфортного проживания. Рядом магазины, кафе, развлечения. Можно арендовать на длительный срок.', 'ул. Приозерная, д. 20', 'Витебск', 6, 3, 4, 2, 95.00),
(5, 'apartment', 'Квартира в центре Гомеля', 'Двухкомнатная квартира в историческом центре. Рядом парки, музеи, рестораны. Отличное расположение для туристов. Квартира в старинном доме с высокими потолками. Современный ремонт сочетается с историческими элементами. Вся необходимая техника, мебель. Район тихий, но в шаговой доступности все необходимое. Много достопримечательностей поблизости.', 'ул. Советская, д. 30, кв. 7', 'Гомель', 4, 2, 2, 1, 70.00);

-- Insert property images
INSERT INTO property_images (property_id, image_url, is_main) VALUES
(1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop', TRUE),
(1, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop', FALSE),
(1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop', FALSE),
(1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop', FALSE),
(2, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop', TRUE),
(2, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', FALSE),
(2, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', FALSE),
(2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop', FALSE),
(3, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop', TRUE),
(3, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop', FALSE),
(3, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop', FALSE),
(4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', TRUE),
(4, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop', FALSE),
(4, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop', FALSE),
(4, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', FALSE),
(5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop', TRUE),
(5, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop', FALSE),
(6, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop', TRUE),
(6, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop', FALSE),
(6, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop', FALSE),
(7, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop', TRUE),
(7, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop', FALSE),
(7, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop', FALSE),
(8, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop', TRUE),
(8, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop', FALSE),
(8, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop', FALSE);

-- Insert property amenities
INSERT INTO property_amenities (property_id, amenity) VALUES
(1, 'wifi'), (1, 'kitchen'), (1, 'tv'), (1, 'washer'), (1, 'parking'),
(2, 'wifi'), (2, 'kitchen'), (2, 'tv'), (2, 'washer'), (2, 'parking'), (2, 'pool'),
(3, 'wifi'), (3, 'kitchen'), (3, 'tv'), (3, 'washer'),
(4, 'wifi'), (4, 'kitchen'), (4, 'tv'), (4, 'washer'), (4, 'parking'), (4, 'pool'),
(5, 'wifi'), (5, 'kitchen'), (5, 'washer'),
(6, 'wifi'), (6, 'kitchen'), (6, 'tv'), (6, 'washer'), (6, 'parking'),
(7, 'wifi'), (7, 'kitchen'), (7, 'tv'), (7, 'washer'), (7, 'parking'), (7, 'pool'),
(8, 'wifi'), (8, 'kitchen'), (8, 'tv'), (8, 'washer'), (8, 'parking');

-- Insert bookings
INSERT INTO bookings (user_id, property_id, check_in, check_out, guests, total_price, status) VALUES
(3, 1, '2024-12-20', '2024-12-25', 2, 17500.00, 'confirmed'),
(4, 2, '2024-12-15', '2024-12-20', 6, 60000.00, 'pending'),
(5, 3, '2024-12-10', '2024-12-15', 2, 14000.00, 'completed'),
(2, 4, '2025-01-05', '2025-01-10', 8, 125000.00, 'confirmed'),
(3, 5, '2024-12-18', '2024-12-22', 1, 6000.00, 'pending');

-- Insert reviews
INSERT INTO reviews (user_id, property_id, rating, comment) VALUES
(3, 1, 5, 'Отличная квартира! Все чисто, уютно, расположение идеальное. Рекомендую!'),
(5, 3, 4, 'Хорошая студия, все необходимое есть. Немного шумно из-за центрального расположения, но в целом отлично.'),
(2, 4, 5, 'Роскошный коттедж! Вид на озеро просто потрясающий. Обязательно вернемся!');

-- Insert favorites
INSERT INTO favorites (user_id, property_id) VALUES
(2, 3), (2, 4),
(3, 2), (3, 5),
(4, 1), (4, 7),
(5, 2), (5, 6);

-- Insert property views (for statistics)
INSERT INTO property_views (property_id, viewed_at) VALUES
(1, '2024-12-01 10:00:00'), (1, '2024-12-01 11:00:00'), (1, '2024-12-02 09:00:00'),
(2, '2024-12-01 12:00:00'), (2, '2024-12-01 13:00:00'),
(3, '2024-12-01 14:00:00'), (3, '2024-12-02 10:00:00'), (3, '2024-12-02 11:00:00'),
(4, '2024-12-01 15:00:00'),
(5, '2024-12-01 16:00:00'), (5, '2024-12-02 12:00:00'),
(6, '2024-12-01 17:00:00'),
(7, '2024-12-02 13:00:00'), (7, '2024-12-02 14:00:00'),
(8, '2024-12-02 15:00:00');

