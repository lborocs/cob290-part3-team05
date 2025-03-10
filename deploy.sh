REPO_DIR="/home/ubuntu/repo"
ROOT_DIR="/home/ubuntu/"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
BUILD_DIR="$FRONTEND_DIR/dist"
TARGET_DIR="/var/www/html" # Frontend
TARGET_BACKEND="/var/www/html/api" # Backend

echo "Installing frontend dependencies..."
cd $FRONTEND_DIR
npm install

echo "Installing backend dependencies..."
cd $BACKEND_DIR
npm install

echo "Building the frontend project..."
cd $FRONTEND_DIR
npm run build

echo "Clearing old frontend build..."
sudo rm -rf $TARGET_DIR/*

echo "Pushing new frontend build..."
sudo cp -r $BUILD_DIR/* $TARGET_DIR/

echo "Pushing backend..."
sudo mkdir -p $TARGET_BACKEND
sudo cp -r $BACKEND_DIR/* $TARGET_BACKEND/

echo "Installing backend production dependencies..."
cd $TARGET_BACKEND
npm install --production

echo "Pushing .htaccess..."
sudo cp -r $ROOT_DIR/.htaccess $TARGET_DIR/

echo "Restarting Apache..."
sudo systemctl restart apache2

echo "Complete!"