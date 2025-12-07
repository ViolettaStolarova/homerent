# Homerent - Платформа для бронирования и аренды недвижимости

Курсовая работа - онлайн-платформа для бронирования и аренды недвижимости (аналог Airbnb/Avito-недвижимость/Циан).

## Технологический стек

### Backend

- PHP 8.1+
- MySQL
- REST API
- JWT аутентификация

### Frontend

- React 18
- TypeScript
- RTK Query
- Feature-Sliced Design (FSD)
- SCSS модули
- Material-UI
- Vite

## Структура проекта

```
homerent/
├── backend/          # PHP backend
│   ├── App/          # Приложение
│   ├── config/       # Конфигурация
│   ├── routes/       # Маршруты
│   ├── database/     # SQL скрипты
│   └── index.php     # Точка входа
├── frontend/         # React frontend
│   ├── src/
│   │   ├── app/      # Инициализация приложения
│   │   ├── pages/    # Страницы
│   │   ├── widgets/  # Виджеты
│   │   ├── features/ # Фичи
│   │   ├── entities/ # Сущности
│   │   └── shared/   # Общие компоненты
│   └── package.json
└── README.md
```

## Установка и запуск

### Требования

- XAMPP (Apache + MySQL)
- PHP 8.1+
- Node.js 18+
- Composer

### Backend

1. Скопируйте проект в папку `htdocs` XAMPP:

```bash
cp -r homerent /Applications/XAMPP/htdocs/
# или для Windows
xcopy homerent C:\xampp\htdocs\homerent\ /E /I
```

2. Установите зависимости PHP:

```bash
cd backend
composer install
```

3. Создайте базу данных:

   - Откройте phpMyAdmin (http://localhost/phpmyadmin)
   - Импортируйте файл `backend/database/schema.sql`
   - Импортируйте файл `backend/database/seed.sql` для тестовых данных

4. Настройте конфигурацию в `backend/config/config.php`:

   - Измените `jwt_secret` на свой секретный ключ
   - Настройте параметры email (если нужно)

5. Убедитесь, что Apache запущен в XAMPP

6. Backend будет доступен по адресу: `http://localhost/homerent/backend/`

### Frontend

1. Перейдите в папку frontend:

```bash
cd frontend
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите dev-сервер:

```bash
npm run dev
```

4. Frontend будет доступен по адресу: `http://localhost:5173`

## Тестовые данные

После импорта `seed.sql` будут созданы:

### Пользователи

- **Администратор**:

  - Email: `admin@homerent.com`
  - Пароль: `admin123`

- **Обычные пользователи**:
  - Email: `user1@homerent.com` - `user4@homerent.com`
  - Пароль: `password123` (для всех)

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/verify-email` - Подтверждение email
- `POST /api/auth/forgot-password` - Восстановление пароля
- `POST /api/auth/reset-password` - Сброс пароля
- `GET /api/auth/me` - Текущий пользователь

### Объявления

- `GET /api/properties` - Список объявлений (с фильтрами)
- `GET /api/properties/{id}` - Детали объявления
- `POST /api/properties` - Создать объявление (требует авторизации)
- `PUT /api/properties/{id}` - Обновить объявление
- `DELETE /api/properties/{id}` - Удалить объявление

### Бронирования

- `GET /api/bookings` - Список бронирований
- `GET /api/bookings/{id}` - Детали бронирования
- `POST /api/bookings` - Создать бронирование
- `PUT /api/bookings/{id}/cancel` - Отменить бронирование
- `PUT /api/bookings/{id}/confirm` - Подтвердить бронирование (для владельца)
- `PUT /api/bookings/{id}/reject` - Отклонить бронирование (для владельца)

### Избранное

- `GET /api/favorites` - Список избранного
- `POST /api/favorites` - Добавить/удалить из избранного

### Пользователи

- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновить профиль
- `PUT /api/users/password` - Сменить пароль
- `GET /api/users/properties` - Мои объявления
- `GET /api/users/incoming-bookings` - Входящие бронирования

### Отзывы

- `POST /api/reviews` - Создать отзыв

### Админ-панель

- `GET /api/admin/stats` - Статистика
- `GET /api/admin/export` - Экспорт данных
- `PUT /api/admin/users/{id}/block` - Заблокировать пользователя

## Swagger документация

Swagger документация доступна по адресу: `http://localhost/homerent/backend/swagger.php`

(Требует установки библиотеки для Swagger в PHP)

## Роли пользователей

1. **Гость** - просмотр объявлений без бронирования
2. **Пользователь** - все функции гостя + бронирование, создание объявлений, личный кабинет
3. **Администратор** - все функции пользователя + блокировка пользователей, статистика, экспорт данных

## Разработка

### Backend

- Структура следует PSR-4
- Используется простой роутер
- Middleware для аутентификации и авторизации
- PDO для работы с БД

### Frontend

- Архитектура Feature-Sliced Design
- RTK Query для работы с API
- SCSS модули для стилей
- Material-UI для компонентов
