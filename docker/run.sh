#!/bin/sh

cd /var/www/html

# Run migrations
php artisan migrate --force

# Start Apache
/usr/sbin/apache2ctl -D FOREGROUND
