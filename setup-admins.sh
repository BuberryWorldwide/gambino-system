#!/bin/bash
# setup-admins.sh - Script to set up your admin accounts

echo "🎯 Setting up Gambino Admin System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo -e "${YELLOW}Step 1: Creating Super Admin (You)${NC}"
echo "Enter your details for the super admin account:"

read -p "First Name: " SUPER_FIRST_NAME
read -p "Last Name: " SUPER_LAST_NAME
read -p "Email: " SUPER_EMAIL
read -s -p "Password: " SUPER_PASSWORD
echo

# Create super admin
echo -e "\n${YELLOW}Creating super admin...${NC}"
SUPER_ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"${SUPER_FIRST_NAME}\",
    \"lastName\": \"${SUPER_LAST_NAME}\",
    \"email\": \"${SUPER_EMAIL}\",
    \"password\": \"${SUPER_PASSWORD}\"
  }")

echo "Response: $SUPER_ADMIN_RESPONSE"

if echo "$SUPER_ADMIN_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Super admin created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create super admin${NC}"
    exit 1
fi

# Login as super admin to get token
echo -e "\n${YELLOW}Logging in as super admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${SUPER_EMAIL}\",
    \"password\": \"${SUPER_PASSWORD}\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get admin token${NC}"
    echo "Login response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Super admin logged in successfully!${NC}"

# Create store admins
echo -e "\n${YELLOW}Step 2: Creating Store Admins${NC}"

# Store admin for Nashville Downtown Gaming
echo -e "\n${YELLOW}Creating Nashville store admin...${NC}"
NASH_ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/create-store-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "firstName": "Nash",
    "lastName": "Admin", 
    "email": "nash.admin@volunteergaming.com",
    "storeId": "nash_downtown",
    "storeName": "Nashville Downtown Gaming"
  }')

echo "Nashville Admin Response: $NASH_ADMIN_RESPONSE"

# Store admin for Memphis Beale Street
echo -e "\n${YELLOW}Creating Memphis store admin...${NC}"
MEM_ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/create-store-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "firstName": "Memphis",
    "lastName": "Admin",
    "email": "memphis.admin@volunteergaming.com", 
    "storeId": "mem_beale",
    "storeName": "Memphis Beale Street"
  }')

echo "Memphis Admin Response: $MEM_ADMIN_RESPONSE"

# Store admin for Knoxville Campus Hub
echo -e "\n${YELLOW}Creating Knoxville store admin...${NC}"
KNOX_ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/create-store-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "firstName": "Knox",
    "lastName": "Admin",
    "email": "knox.admin@volunteergaming.com",
    "storeId": "knox_campus", 
    "storeName": "Knoxville Campus Hub"
  }')

echo "Knoxville Admin Response: $KNOX_ADMIN_RESPONSE"

# Store admin for Chattanooga Market Square
echo -e "\n${YELLOW}Creating Chattanooga store admin...${NC}"
CHAT_ADMIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/admin/create-store-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "firstName": "Chat",
    "lastName": "Admin",
    "email": "chat.admin@volunteergaming.com",
    "storeId": "chat_market",
    "storeName": "Chattanooga Market Square"  
  }')

echo "Chattanooga Admin Response: $CHAT_ADMIN_RESPONSE"

echo -e "\n${GREEN}🎉 Admin setup complete!${NC}"
echo -e "\n${YELLOW}📋 Admin Account Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Super Admin (You):${NC}"
echo "  Email: ${SUPER_EMAIL}"
echo "  Access: Full system access, all stores, user management, financial controls"
echo ""
echo -e "${GREEN}Store Admins:${NC}"
echo "  Nashville: nash.admin@volunteergaming.com"
echo "  Memphis: memphis.admin@volunteergaming.com" 
echo "  Knoxville: knox.admin@volunteergaming.com"
echo "  Chattanooga: chat.admin@volunteergaming.com"
echo ""
echo -e "${YELLOW}Note: Store admins have temporary passwords. They must change them on first login.${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test admin login: curl -X POST ${BASE_URL}/api/admin/login -H 'Content-Type: application/json' -d '{\"email\":\"${SUPER_EMAIL}\",\"password\":\"${SUPER_PASSWORD}\"}'"
echo "2. Build admin dashboard frontend"
echo "3. Distribute store admin credentials securely"
echo ""
echo -e "${GREEN}✅ Your Gambino admin system is ready!${NC}"