#!/bin/sh

cd /var/www/html

# Run migrations
php artisan migrate --force

# Seed database (Automatically populate data on deployment)
php artisan db:seed --force

# Start Apache
/usr/sbin/apache2ctl -D FOREGROUND
