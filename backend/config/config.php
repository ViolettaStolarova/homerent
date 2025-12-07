<?php

return [
    'jwt_secret' => 'your-secret-key-change-in-production',
    'jwt_expiration' => 86400, // 24 hours
    'email' => [
        'smtp_host' => 'smtp.gmail.com',
        'smtp_port' => 587,
        'smtp_user' => 'parkir.in.park090@gmail.com',
        'smtp_pass' => 'onxd kciu bhht upqe',
        'from_email' => 'noreply@homerent.com',
        'from_name' => 'Homerent'
    ],
    'upload_path' => __DIR__ . '/../uploads/',
    'base_url' => 'http://localhost/homerent/backend/'
];