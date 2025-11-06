#!/bin/bash
# TrackEd Deployment Script for VPS
# Run these commands on your VPS: root@31.97.48.120

echo "=========================================="
echo "TrackEd Deployment to smitracked.cloud"
echo "=========================================="

# Step 1: Clone Repository
echo ""
echo "Step 1: Cloning repository..."
cd /var/www/smitracked
git clone https://github.com/aizypena/TrackEd.git .

# Step 2: Setup Backend
echo ""
echo "Step 2: Setting up Laravel backend..."
cd /var/www/smitracked/tracked-backend

# Copy production environment file
cp .env.production .env

# Install Composer dependencies (production mode)
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate --force

# Run database migrations
php artisan migrate --force

# Create storage symbolic link
php artisan storage:link

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
sudo chown -R www-data:www-data /var/www/smitracked/tracked-backend/storage
sudo chown -R www-data:www-data /var/www/smitracked/tracked-backend/bootstrap/cache
sudo chmod -R 775 /var/www/smitracked/tracked-backend/storage
sudo chmod -R 775 /var/www/smitracked/tracked-backend/bootstrap/cache

echo "✓ Backend setup complete!"

# Step 3: Setup Frontend
echo ""
echo "Step 3: Building React frontend..."
cd /var/www/smitracked/tracked-frontend

# Install npm dependencies
npm install

# Build for production (uses .env.production)
npm run build

echo "✓ Frontend build complete!"

# Step 4: Configure Nginx
echo ""
echo "Step 4: Configuring Nginx..."

cat > /etc/nginx/sites-available/smitracked << 'EOF'
# Frontend - smitracked.cloud
server {
    listen 80;
    server_name smitracked.cloud www.smitracked.cloud;
    
    root /var/www/smitracked/tracked-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# Backend API - api.smitracked.cloud
server {
    listen 80;
    server_name api.smitracked.cloud;
    
    root /var/www/smitracked/tracked-backend/public;
    index index.php;

    # Increase upload size for documents
    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/smitracked /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

echo "✓ Nginx configured and restarted!"

# Step 5: Setup Queue Workers with PM2
echo ""
echo "Step 5: Setting up Laravel queue workers..."
cd /var/www/smitracked/tracked-backend

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'laravel-queue',
    script: 'php',
    args: 'artisan queue:work --sleep=3 --tries=3 --max-time=3600',
    instances: 2,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Install PM2 if not already installed
npm install -g pm2

# Start queue workers
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✓ Queue workers started with PM2!"

# Step 6: Setup Cron Jobs
echo ""
echo "Step 6: Setting up Laravel scheduler..."

# Add Laravel scheduler to crontab
(crontab -l 2>/dev/null; echo "* * * * * cd /var/www/smitracked/tracked-backend && php artisan schedule:run >> /dev/null 2>&1") | crontab -

echo "✓ Cron job added for Laravel scheduler!"

# Step 7: Configure Firewall
echo ""
echo "Step 7: Configuring firewall..."

# Configure UFW firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo "✓ Firewall configured!"

# Final Summary
echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Ask account owner (albinsalaysay69@gmail.com) to add DNS records:"
echo "   - Type: A, Name: @, Value: 31.97.48.120"
echo "   - Type: A, Name: www, Value: 31.97.48.120"
echo "   - Type: A, Name: api, Value: 31.97.48.120"
echo ""
echo "2. After DNS propagates (24-48 hours), install SSL:"
echo "   sudo certbot --nginx -d smitracked.cloud -d www.smitracked.cloud -d api.smitracked.cloud"
echo ""
echo "3. For now, test with IP address:"
echo "   Frontend: http://31.97.48.120"
echo "   Backend: http://31.97.48.120:8000/api (via Nginx proxy)"
echo ""
echo "Monitor logs:"
echo "   - Nginx: tail -f /var/log/nginx/error.log"
echo "   - Laravel: tail -f /var/www/smitracked/tracked-backend/storage/logs/laravel.log"
echo "   - Queue: pm2 logs laravel-queue"
echo ""
