<?php

use App\Router\Router;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

// Auth routes
$router->post('/api/auth/register', 'AuthController@register');
$router->post('/api/auth/login', 'AuthController@login');
$router->post('/api/auth/verify-email', 'AuthController@verifyEmail');
$router->post('/api/auth/forgot-password', 'AuthController@forgotPassword');
$router->post('/api/auth/reset-password', 'AuthController@resetPassword');
$router->get('/api/auth/me', 'AuthController@me', AuthMiddleware::class);

// Properties routes
$router->get('/api/properties', 'PropertyController@index');
$router->get('/api/properties/{id}', 'PropertyController@show');
$router->post('/api/properties', 'PropertyController@create', AuthMiddleware::class);
$router->put('/api/properties/{id}', 'PropertyController@update', AuthMiddleware::class);
$router->delete('/api/properties/{id}', 'PropertyController@delete', AuthMiddleware::class);

// Bookings routes
$router->get('/api/bookings', 'BookingController@index', AuthMiddleware::class);
$router->get('/api/bookings/{id}', 'BookingController@show', AuthMiddleware::class);
$router->post('/api/bookings', 'BookingController@create', AuthMiddleware::class);
$router->put('/api/bookings/{id}/cancel', 'BookingController@cancel', AuthMiddleware::class);
$router->put('/api/bookings/{id}/confirm', 'BookingController@confirm', AuthMiddleware::class);
$router->put('/api/bookings/{id}/reject', 'BookingController@reject', AuthMiddleware::class);

// Favorites routes
$router->get('/api/favorites', 'FavoriteController@index', AuthMiddleware::class);
$router->post('/api/favorites', 'FavoriteController@toggle', AuthMiddleware::class);

// User routes
$router->get('/api/users/profile', 'UserController@profile', AuthMiddleware::class);
$router->put('/api/users/profile', 'UserController@updateProfile', AuthMiddleware::class);
$router->put('/api/users/password', 'UserController@changePassword', AuthMiddleware::class);
$router->get('/api/users/properties', 'UserController@myProperties', AuthMiddleware::class);
$router->get('/api/users/incoming-bookings', 'UserController@incomingBookings', AuthMiddleware::class);

// Reviews routes
$router->post('/api/reviews', 'ReviewController@create', AuthMiddleware::class);

// Admin routes
$router->get('/api/admin/stats', 'AdminController@stats', AdminMiddleware::class);
$router->get('/api/admin/export', 'AdminController@export', AdminMiddleware::class);
$router->put('/api/admin/users/{id}/block', 'AdminController@blockUser', AdminMiddleware::class);

