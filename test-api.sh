#!/bin/bash

echo "Testing AI template generation API..."

curl -X POST http://localhost:5000/api/generate-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateType": "newsletter",
    "industry": "e-commerce",
    "purpose": "Announce a summer sale with 30% off all products",
    "targetAudience": "Existing customers aged 25-45",
    "brandTone": "friendly",
    "keyPoints": "Sale starts next week, Limited time offer, Free shipping on orders over $50"
  }'