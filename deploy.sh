REPO_DIR="/home/ubuntu/repo"
ROOT_DIR="/home/ubuntu/"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
BUILD_DIR="$FRONTEND_DIR/dist"  # This is where the frontend build files should go
TARGET_DIR="/var/www/html"  # Where Apache serves the frontend
TARGET_BACKEND="/var/www/html/api"  # Backend directory
PM2_APP_NAME="express-app" # Name of pm2 app to run

# Check build directory contents before copying
echo "Checking the build directory..."
ls -l $BUILD_DIR

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd $FRONTEND_DIR
rm -rf node_modules package-lock.json
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd $BACKEND_DIR
rm -rf node_modules package-lock.json
npm install

# Build the frontend project
echo "Building the frontend project..."
cd $FRONTEND_DIR
npm run build

# Check if dist folder is generated
echo "Checking if dist folder is generated..."
sudo ls -l $BUILD_DIR

# Back up phpMyAdmin if it exists, and then proceed with deployment
if [ -d "/var/www/html/phpmyadmin" ]; then
    echo "Backing up phpMyAdmin..."
    sudo cp -r /var/www/html/phpmyadmin /home/ubuntu/phpmyadmin_backup
fi

# Clear old frontend build in target directory
echo "Clearing old frontend build..."
sudo rm -rf $TARGET_DIR/*

# Restore phpMyAdmin
if [ -d "/home/ubuntu/phpmyadmin_backup" ]; then
    echo "Restoring phpMyAdmin..."
    sudo cp -r /home/ubuntu/phpmyadmin_backup /var/www/html/
    echo "Rename backup to phpmyadmin"
    sudo mv /var/www/html/phpmyadmin_backup /var/www/html/phpmyadmin
fi

# Copy new build to target directory
echo "Pushing new frontend build..."
sudo cp -r $BUILD_DIR/* $TARGET_DIR/

# Check if files were copied successfully
echo "Checking the target directory..."
ls -l $TARGET_DIR

# Push backend files (if necessary)
echo "Pushing backend..."
sudo mkdir -p $TARGET_BACKEND
sudo cp -r $BACKEND_DIR/* $TARGET_BACKEND/

# Install backend production dependencies
echo "Installing backend production dependencies..."
cd $TARGET_BACKEND
sudo npm install --production

# Push .env
if [ -f "$REPO_DIR/.env" ]; then
    echo "Pushing environment variables"
    sudo cp -r $REPO_DIR/.env $TARGET_BACKEND/
else
    echo "Warning: .env file not found in $REPO_DIR"
fi

# Restart pm2 service
echo "Restarting pm2 server"
pm2 restart $PM2_APP_NAME

# Restart Apache
echo "Restarting Apache..."
sudo systemctl restart apache2

echo "Complete!"
