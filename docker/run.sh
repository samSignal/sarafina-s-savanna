#!/bin/sh

cd /var/www/html

# Link storage
php artisan storage:link

# Run migrations
php artisan migrate --force

# Seed database (Commented out to prevent slow boot times - run manually if needed)
# php artisan db:seed --force

# Start Queue Worker in background
php artisan queue:work --daemon &

# Start Apache
/usr/sbin/apache2ctl -D FOREGROUND
