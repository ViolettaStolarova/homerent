# Инструкция по установке Homerent

## Шаг 1: Установка Backend

1. Убедитесь, что XAMPP установлен и запущен (Apache и MySQL должны быть активны)

2. Скопируйте папку `backend` в `htdocs`:

   - macOS: `/Applications/XAMPP/htdocs/homerent/backend`
   - Windows: `C:\xampp\htdocs\homerent\backend`

3. Установите зависимости PHP:

```bash
cd backend
composer install
```

Если composer не установлен, установите его:

- macOS: `brew install composer`
- Windows: Скачайте с https://getcomposer.org/

4. Создайте базу данных:

   - Откройте phpMyAdmin: http://localhost/phpmyadmin
   - Создайте новую базу данных или импортируйте `database/schema.sql`
   - Импортируйте `database/seed.sql` для тестовых данных

5. Настройте подключение к БД в `config/database.php` (если нужно):

   - По умолчанию: host='localhost', user='root', password='', dbname='homerent'

6. Проверьте работу API:
   - Откройте: http://localhost/homerent/backend/api/properties
   - Должен вернуться JSON с объявлениями

## Шаг 2: Установка Frontend

1. Убедитесь, что Node.js установлен (версия 18+):

```bash
node --version
```

2. Перейдите в папку frontend:

```bash
cd frontend
```

3. Установите зависимости:

```bash
npm install
```

4. Запустите dev-сервер:

```bash
npm run dev
```

5. Откройте браузер: http://localhost:5173

## Шаг 3: Проверка работы

1. **Регистрация/Вход:**

   - Перейдите на http://localhost:5173
   - Нажмите "Регистрация"
   - Создайте аккаунт или войдите с тестовыми данными:
     - Email: `user1@homerent.com`
     - Пароль: `password123`

2. **Просмотр объявлений:**

   - На главной странице должны отображаться тестовые объявления
   - Можно использовать фильтры поиска

3. **Создание объявления:**

   - Войдите в систему
   - Перейдите в Профиль → Мои объявления
   - Нажмите "Добавить объявление"

4. **Бронирование:**
   - Откройте любое объявление
   - Выберите даты и количество гостей
   - Нажмите "Забронировать"

## Тестовые данные

После импорта `seed.sql` доступны:

**Администратор:**

- Email: `admin@homerent.com`
- Пароль: `admin123`

**Пользователи:**

- Email: `user1@homerent.com` - `user4@homerent.com`
- Пароль: `password123` (для всех)

## Решение проблем

### Backend не работает

- Проверьте, что Apache запущен в XAMPP
- Проверьте путь к файлам в `htdocs`
- Проверьте права доступа к файлам
- Проверьте логи Apache

### Frontend не запускается

- Убедитесь, что Node.js версии 18+
- Удалите `node_modules` и `package-lock.json`, затем `npm install`
- Проверьте, что порт 5173 свободен

### Ошибки подключения к БД

- Проверьте, что MySQL запущен в XAMPP
- Проверьте настройки в `config/database.php`
- Убедитесь, что база данных `homerent` создана

### CORS ошибки

- Убедитесь, что в `backend/index.php` настроены правильные заголовки CORS
- Проверьте настройки прокси в `vite.config.ts`

## Сборка для продакшена

### Frontend

```bash
cd frontend
npm run build
```

Собранные файлы будут в папке `dist/`

### Backend

- Убедитесь, что все зависимости установлены через composer
- Настройте `.htaccess` для правильной работы роутинга
- Настройте права доступа к папке `uploads/` для загрузки изображений

## Дополнительные настройки

### Email отправка

Для работы подтверждения email и восстановления пароля настройте SMTP в `config/config.php`:

```php
'email' => [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_user' => 'parkir.in.park090@gmail.com',
    'smtp_pass' => '7vIntso-0beBi-kaMrad',
    'from_email' => 'noreply@homerent.com',
    'from_name' => 'Homerent'
]
```

### Загрузка изображений

Создайте папку `backend/uploads/` и настройте права доступа:

```bash
mkdir backend/uploads
chmod 755 backend/uploads
```

## Поддержка

При возникновении проблем проверьте:

1. Логи Apache (XAMPP → Logs)
2. Консоль браузера (F12)
3. Логи PHP (если включены)
