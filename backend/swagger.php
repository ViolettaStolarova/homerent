<?php
/**
 * Swagger документация для API Homerent
 * 
 * Для полноценной работы требуется установка swagger-php:
 * composer require zircote/swagger-php
 */

header('Content-Type: application/json');

$swagger = [
    'openapi' => '3.0.0',
    'info' => [
        'title' => 'Homerent API',
        'version' => '1.0.0',
        'description' => 'API для платформы бронирования недвижимости Homerent',
    ],
    'servers' => [
        [
            'url' => 'http://localhost/homerent/backend',
            'description' => 'Локальный сервер',
        ],
    ],
    'paths' => [
        '/api/auth/register' => [
            'post' => [
                'tags' => ['Auth'],
                'summary' => 'Регистрация пользователя',
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['email', 'password', 'full_name'],
                                'properties' => [
                                    'email' => ['type' => 'string', 'format' => 'email'],
                                    'password' => ['type' => 'string', 'minLength' => 6],
                                    'full_name' => ['type' => 'string'],
                                    'username' => ['type' => 'string'],
                                ],
                            ],
                        ],
                    ],
                ],
                'responses' => [
                    '201' => ['description' => 'Успешная регистрация'],
                    '400' => ['description' => 'Ошибка валидации'],
                ],
            ],
        ],
        '/api/auth/login' => [
            'post' => [
                'tags' => ['Auth'],
                'summary' => 'Вход в систему',
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['email', 'password'],
                                'properties' => [
                                    'email' => ['type' => 'string'],
                                    'password' => ['type' => 'string'],
                                ],
                            ],
                        ],
                    ],
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Успешный вход',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'token' => ['type' => 'string'],
                                        'user' => ['type' => 'object'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    '401' => ['description' => 'Неверные учетные данные'],
                ],
            ],
        ],
        '/api/properties' => [
            'get' => [
                'tags' => ['Properties'],
                'summary' => 'Получить список объявлений',
                'parameters' => [
                    ['name' => 'page', 'in' => 'query', 'schema' => ['type' => 'integer']],
                    ['name' => 'limit', 'in' => 'query', 'schema' => ['type' => 'integer']],
                    ['name' => 'city', 'in' => 'query', 'schema' => ['type' => 'string']],
                    ['name' => 'check_in', 'in' => 'query', 'schema' => ['type' => 'string', 'format' => 'date']],
                    ['name' => 'check_out', 'in' => 'query', 'schema' => ['type' => 'string', 'format' => 'date']],
                    ['name' => 'guests', 'in' => 'query', 'schema' => ['type' => 'integer']],
                    ['name' => 'property_type', 'in' => 'query', 'schema' => ['type' => 'string', 'enum' => ['apartment', 'house', 'room', 'cottage']]],
                    ['name' => 'min_price', 'in' => 'query', 'schema' => ['type' => 'number']],
                    ['name' => 'max_price', 'in' => 'query', 'schema' => ['type' => 'number']],
                    ['name' => 'sort_by', 'in' => 'query', 'schema' => ['type' => 'string']],
                ],
                'responses' => [
                    '200' => [
                        'description' => 'Список объявлений',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'properties' => ['type' => 'array'],
                                        'pagination' => ['type' => 'object'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'post' => [
                'tags' => ['Properties'],
                'summary' => 'Создать объявление',
                'security' => [['BearerAuth' => []]],
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['property_type', 'title', 'description', 'address', 'city', 'max_guests', 'bedrooms', 'beds', 'bathrooms', 'price_per_night'],
                                'properties' => [
                                    'property_type' => ['type' => 'string', 'enum' => ['apartment', 'house', 'room', 'cottage']],
                                    'title' => ['type' => 'string'],
                                    'description' => ['type' => 'string', 'minLength' => 500],
                                    'address' => ['type' => 'string'],
                                    'city' => ['type' => 'string'],
                                    'max_guests' => ['type' => 'integer'],
                                    'bedrooms' => ['type' => 'integer'],
                                    'beds' => ['type' => 'integer'],
                                    'bathrooms' => ['type' => 'integer'],
                                    'price_per_night' => ['type' => 'number'],
                                    'amenities' => ['type' => 'array', 'items' => ['type' => 'string']],
                                    'images' => ['type' => 'array', 'items' => ['type' => 'string']],
                                ],
                            ],
                        ],
                    ],
                ],
                'responses' => [
                    '201' => ['description' => 'Объявление создано'],
                    '401' => ['description' => 'Не авторизован'],
                ],
            ],
        ],
        '/api/properties/{id}' => [
            'get' => [
                'tags' => ['Properties'],
                'summary' => 'Получить детали объявления',
                'parameters' => [
                    ['name' => 'id', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']],
                ],
                'responses' => [
                    '200' => ['description' => 'Детали объявления'],
                    '404' => ['description' => 'Объявление не найдено'],
                ],
            ],
        ],
        '/api/bookings' => [
            'post' => [
                'tags' => ['Bookings'],
                'summary' => 'Создать бронирование',
                'security' => [['BearerAuth' => []]],
                'requestBody' => [
                    'required' => true,
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'required' => ['property_id', 'check_in', 'check_out', 'guests'],
                                'properties' => [
                                    'property_id' => ['type' => 'integer'],
                                    'check_in' => ['type' => 'string', 'format' => 'date'],
                                    'check_out' => ['type' => 'string', 'format' => 'date'],
                                    'guests' => ['type' => 'integer'],
                                ],
                            ],
                        ],
                    ],
                ],
                'responses' => [
                    '201' => ['description' => 'Бронирование создано'],
                    '400' => ['description' => 'Ошибка валидации'],
                ],
            ],
        ],
    ],
    'components' => [
        'securitySchemes' => [
            'BearerAuth' => [
                'type' => 'http',
                'scheme' => 'bearer',
                'bearerFormat' => 'JWT',
            ],
        ],
    ],
];

echo json_encode($swagger, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

