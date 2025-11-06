#!/bin/bash

# Test script to verify equipment categories API
echo "Testing Equipment Categories API..."
echo "===================================="
echo ""

# First, login as staff to get token
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST https://api.smitracked.cloud/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smi.edu.ph","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Please check staff credentials."
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test categories endpoint
echo "2. Fetching equipment categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET https://api.smitracked.cloud/api/equipment/categories \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Categories Response:"
echo "$CATEGORIES_RESPONSE" | python3 -m json.tool
echo ""

# Count categories
COUNT=$(echo "$CATEGORIES_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null)

echo "===================================="
echo "✅ Total programs/categories found: $COUNT"
echo "===================================="
