#!/bin/sh
set -e

echo "🚀 Starting E-Governance Complaint Management System..."

# Function to wait for database to be ready (if using external DB)
wait_for_db() {
    if [ "$DATABASE_URL" != "file:/app/data/prod.db" ]; then
        echo "⏳ Waiting for database to be ready..."
        
        # Extract database details from URL for connection testing
        # This is a simplified check - in production, you might want more robust checking
        timeout=30
        count=0
        
        while [ $count -lt $timeout ]; do
            if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
                echo "✅ Database is ready!"
                break
            else
                echo "⏳ Database not ready yet. Waiting..."
                sleep 2
                count=$((count + 1))
            fi
        done
        
        if [ $count -eq $timeout ]; then
            echo "❌ Database connection timeout. Exiting..."
            exit 1
        fi
    fi
}

# Function to initialize database
init_database() {
    echo "🗄️ Initializing database..."
    
    # Generate Prisma client (in case it wasn't generated during build)
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    echo "🏗️ Running database migrations..."
    if [ "$NODE_ENV" = "production" ]; then
        npx prisma migrate deploy
    else
        npx prisma db push
    fi
    
    # Check if database needs seeding (only for SQLite and if no users exist)
    if [ "$DATABASE_URL" = "file:/app/data/prod.db" ]; then
        echo "🌱 Checking if database needs seeding..."
        
        # Simple check to see if admin user exists
        USER_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM users WHERE role = 'ADMINISTRATOR';
EOF
2>/dev/null || echo "0")
        
        if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
            echo "🌱 Seeding database with initial data..."
            npm run db:seed 2>/dev/null || echo "⚠️ Database seeding failed or not configured"
        else
            echo "✅ Database already contains data, skipping seed"
        fi
    fi
}

# Function to check required environment variables
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    # Check if JWT_SECRET is set
    if [ -z "$JWT_SECRET" ]; then
        echo "⚠️ JWT_SECRET not set, generating a random one (not recommended for production)"
        export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    fi
    
    # Set default values for optional variables
    export PORT=${PORT:-3000}
    export NODE_ENV=${NODE_ENV:-production}
    export CORS_ORIGIN=${CORS_ORIGIN:-"*"}
    export MAX_FILE_SIZE=${MAX_FILE_SIZE:-10485760}
    export UPLOAD_PATH=${UPLOAD_PATH:-"/app/uploads"}
    export LOG_LEVEL=${LOG_LEVEL:-"info"}
    
    echo "✅ Environment variables configured"
}

# Function to create necessary directories
setup_directories() {
    echo "📁 Setting up directories..."
    
    # Ensure upload directory exists
    mkdir -p "$UPLOAD_PATH"
    mkdir -p "$UPLOAD_PATH/complaints"
    mkdir -p "$UPLOAD_PATH/profiles"
    mkdir -p "$UPLOAD_PATH/temp"
    
    # Ensure logs directory exists
    mkdir -p /app/logs
    
    # Ensure data directory exists (for SQLite)
    mkdir -p /app/data
    
    echo "✅ Directories created"
}

# Function to perform health checks
health_check() {
    echo "🏥 Performing initial health checks..."
    
    # Check if uploads directory is writable
    if [ ! -w "$UPLOAD_PATH" ]; then
        echo "❌ Upload directory is not writable: $UPLOAD_PATH"
        exit 1
    fi
    
    # Check if we can write to data directory (for SQLite)
    if [ "$DATABASE_URL" = "file:/app/data/prod.db" ] && [ ! -w /app/data ]; then
        echo "❌ Data directory is not writable: /app/data"
        exit 1
    fi
    
    echo "✅ Health checks passed"
}

# Function to cleanup on shutdown
cleanup() {
    echo "🔄 Shutting down gracefully..."
    # Add any cleanup tasks here
    exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

# Main execution
main() {
    echo "🏁 Starting initialization sequence..."
    
    check_env_vars
    setup_directories
    health_check
    wait_for_db
    init_database
    
    echo "🎉 Initialization complete! Starting application..."
    echo "📍 Application will be available on port $PORT"
    echo "🗄️ Database: $DATABASE_URL"
    echo "📂 Upload path: $UPLOAD_PATH"
    echo "🌍 Environment: $NODE_ENV"
    
    # Start the application
    exec npm start
}

# Handle different command arguments
case "$1" in
    "npm"|"node"|"npx")
        # If command starts with npm, node, or npx, execute it directly
        exec "$@"
        ;;
    "bash"|"sh")
        # Allow shell access for debugging
        exec "$@"
        ;;
    "migrate")
        # Run migrations only
        echo "🏗️ Running database migrations only..."
        check_env_vars
        wait_for_db
        npx prisma migrate deploy
        exit 0
        ;;
    "seed")
        # Run seeding only
        echo "🌱 Running database seeding only..."
        check_env_vars
        wait_for_db
        npm run db:seed
        exit 0
        ;;
    "health")
        # Health check only
        check_env_vars
        health_check
        echo "✅ Health check passed"
        exit 0
        ;;
    *)
        # Default: start the application
        main
        ;;
esac
