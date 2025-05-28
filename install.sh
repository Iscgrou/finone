#!/bin/bash

# VPN Billing System Auto-Installation Script  
# Repository: https://github.com/Iscgrou/finone
# 
# One-Link Installation: curl -fsSL https://raw.githubusercontent.com/Iscgrou/finone/main/install.sh | bash
# 
# This script provides a complete automated installation of the VPN Billing System with:
# - AI-powered analytics using xAI Grok
# - Telegram notifications and reporting
# - Google Drive backup integration  
# - Invoice template management with PDF/Image output
# - Multi-user access control system
# - Persian RTL interface with comprehensive features

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  VPN Billing System Installer${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js if not present
install_nodejs() {
    if ! command_exists node; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_status "Node.js is already installed ($(node --version))"
    fi
}

# Function to install PostgreSQL if not present
install_postgresql() {
    if ! command_exists psql; then
        print_status "Installing PostgreSQL..."
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        print_status "PostgreSQL is already installed"
    fi
}

# Function to create database and user
setup_database() {
    print_status "Setting up database..."
    
    # Create database user and database
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
    
    print_status "Database setup completed"
}

# Function to install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    sudo apt-get update
    sudo apt-get install -y curl wget git unzip nginx certbot python3-certbot-nginx
}

# Function to setup SSL certificate
setup_ssl() {
    if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
        print_status "Setting up SSL certificate for $DOMAIN..."
        sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL"
    else
        print_warning "Skipping SSL setup for local domain"
    fi
}

# Function to setup Nginx
setup_nginx() {
    print_status "Configuring Nginx..."
    
    sudo tee /etc/nginx/sites-available/vpn-billing > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/vpn-billing /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."
    
    sudo tee /etc/systemd/system/vpn-billing.service > /dev/null <<EOF
[Unit]
Description=VPN Billing System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
Environment=DOMAIN=$DOMAIN
Environment=ADMIN_EMAIL=$ADMIN_EMAIL
Environment=TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
Environment=OPENAI_API_KEY=$OPENAI_API_KEY
Environment=GOOGLE_DRIVE_EMAIL=$GOOGLE_DRIVE_EMAIL
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable vpn-billing
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    cat > "$INSTALL_DIR/.env" <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
DOMAIN=$DOMAIN
ADMIN_EMAIL=$ADMIN_EMAIL
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
OPENAI_API_KEY=$OPENAI_API_KEY
GOOGLE_DRIVE_EMAIL=$GOOGLE_DRIVE_EMAIL
ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
}

# Main installation function
main() {
    print_header
    
    # Collect user input
    echo "Please provide the following information:"
    echo
    
    read -p "Domain name (e.g., vpn-billing.example.com): " DOMAIN
    read -p "Admin email: " ADMIN_EMAIL
    read -p "Admin username: " ADMIN_USERNAME
    read -s -p "Admin password: " ADMIN_PASSWORD
    echo
    read -p "Database name [vpn_billing]: " DB_NAME
    DB_NAME=${DB_NAME:-vpn_billing}
    read -p "Database user [vpn_user]: " DB_USER
    DB_USER=${DB_USER:-vpn_user}
    read -s -p "Database password: " DB_PASSWORD
    echo
    read -p "Telegram Bot Token (optional): " TELEGRAM_BOT_TOKEN
    read -p "OpenAI API Key (optional): " OPENAI_API_KEY
    read -p "Google Drive Email for backups (optional): " GOOGLE_DRIVE_EMAIL
    read -p "Installation directory [/opt/vpn-billing]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-/opt/vpn-billing}
    
    echo
    print_status "Starting installation..."
    
    # Install dependencies
    install_dependencies
    install_nodejs
    install_postgresql
    
    # Setup database
    setup_database
    
    # Clone and setup application
    print_status "Cloning repository..."
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown "$USER:$USER" "$INSTALL_DIR"
    
    if [ -d "$INSTALL_DIR/.git" ]; then
        cd "$INSTALL_DIR"
        git pull origin main
    else
        git clone https://github.com/Iscgrou/finone.git "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    
    # Install npm dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    # Create environment file
    create_env_file
    
    # Build application
    print_status "Building application..."
    npm run build
    
    # Setup database schema
    print_status "Setting up database schema..."
    npm run db:push
    
    # Setup Nginx
    setup_nginx
    
    # Setup SSL
    setup_ssl
    
    # Create systemd service
    create_systemd_service
    
    # Start services
    print_status "Starting services..."
    sudo systemctl start vpn-billing
    
    # Final status check
    sleep 5
    if sudo systemctl is-active --quiet vpn-billing; then
        print_status "Installation completed successfully!"
        echo
        echo "Access your VPN Billing System at:"
        if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
            echo "  https://$DOMAIN"
        else
            echo "  http://$DOMAIN:5000"
        fi
        echo
        echo "Default admin login:"
        echo "  Username: $ADMIN_USERNAME"
        echo "  Password: [as provided]"
        echo
        echo "Service management commands:"
        echo "  sudo systemctl status vpn-billing"
        echo "  sudo systemctl restart vpn-billing"
        echo "  sudo systemctl stop vpn-billing"
        echo
        echo "Logs: sudo journalctl -u vpn-billing -f"
    else
        print_error "Installation completed but service failed to start"
        print_error "Check logs: sudo journalctl -u vpn-billing -f"
        exit 1
    fi
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Run main function
main "$@"