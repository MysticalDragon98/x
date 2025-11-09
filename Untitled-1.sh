#!/bin/bash
API_KEY="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"
MODEL="gpt-5-mini"
PROMPT=$1
INPUT=$2

RESPONSE=$(curl -s \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"$PROMPT $INPUT\",
    \"max_tokens\": 1024
  }" \
  https://api.openai.com/v1/completions)

echo "$RESPONSE" | jq -r '.choices[0].text'
