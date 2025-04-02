#!/bin/bash

echo "Testing AI template generation API with save option..."

curl -X POST http://localhost:5000/api/generate-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateType": "promotional",
    "industry": "fitness",
    "purpose": "Promote a new fitness program for busy professionals",
    "targetAudience": "Working professionals aged 30-50",
    "brandTone": "motivational",
    "keyPoints": "30-minute workouts, No equipment needed, Certified trainers, Money-back guarantee",
    "saveTemplate": true
  }'