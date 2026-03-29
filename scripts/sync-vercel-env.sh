#!/bin/bash
set -euo pipefail

# =============================================================================
# Vercel Environment Variable Sync Script
# =============================================================================
# 1. Deletes all team-level shared env vars
# 2. Creates shared env vars (production.env → production, staging.env → preview+development)
# 3. Uploads app-specific env vars to each project
# =============================================================================

SCRIPT_DIR_INIT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR_INIT}/../.env.vercel"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env.vercel not found. Create it with:"
  echo "  VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_WEB_PROJECT, VERCEL_ADMIN_PROJECT, VERCEL_PROGRAMS_PROJECT"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

TOKEN="$VERCEL_TOKEN"
TEAM_ID="$VERCEL_TEAM_ID"
API="https://api.vercel.com"

# Project IDs
WEB_PROJECT="$VERCEL_WEB_PROJECT"
ADMIN_PROJECT="$VERCEL_ADMIN_PROJECT"
PROGRAMS_PROJECT="$VERCEL_PROGRAMS_PROJECT"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENVS_DIR="$SCRIPT_DIR/../envs"

# Parse .env file into JSON array of {key, value} objects
parse_env_to_json() {
  local file="$1"
  local first=true
  echo -n "["
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    key="${line%%=*}"
    value="${line#*=}"
    value="${value#\"}"
    value="${value%\"}"

    if [ "$first" = true ]; then
      first=false
    else
      echo -n ","
    fi

    escaped_value=$(echo -n "$value" | jq -Rs '.')
    echo -n "{\"key\":\"$key\",\"value\":$escaped_value}"
  done < "$file"
  echo -n "]"
}

echo "=========================================="
echo "Step 1: Delete all team-level shared env vars"
echo "=========================================="

count=0
while true; do
  existing=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API/v1/env?teamId=$TEAM_ID&limit=100")

  # Collect all IDs as a JSON array
  ids_json=$(echo "$existing" | jq '[.data[]?.id // empty]')
  id_count=$(echo "$ids_json" | jq 'length')

  if [ "$id_count" -eq 0 ]; then
    break
  fi

  # Batch delete with JSON body
  curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"ids\":$ids_json}" \
    "$API/v1/env?teamId=$TEAM_ID" > /dev/null

  count=$((count + id_count))
done

if [ "$count" -eq 0 ]; then
  echo "No existing team env vars to delete."
else
  echo "Deleted $count team env vars."
fi

echo ""
echo "=========================================="
echo "Step 2: Create shared env vars (team-level)"
echo "=========================================="

echo "Creating shared PRODUCTION env vars..."
prod_evs=$(parse_env_to_json "$ENVS_DIR/shared/production.env")
prod_count=$(echo "$prod_evs" | jq 'length')

response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"evs\":$prod_evs,\"type\":\"encrypted\",\"target\":[\"production\"]}" \
  "$API/v1/env?teamId=$TEAM_ID")

error=$(echo "$response" | jq -r '.error.message // empty')
if [ -n "$error" ]; then
  echo "ERROR creating production shared vars: $error"
  echo "$response" | jq .
else
  echo "Created $prod_count shared env vars for production target."
fi

echo "Creating shared STAGING env vars (preview + development)..."
staging_evs=$(parse_env_to_json "$ENVS_DIR/shared/staging.env")
staging_count=$(echo "$staging_evs" | jq 'length')

response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"evs\":$staging_evs,\"type\":\"encrypted\",\"target\":[\"preview\",\"development\"]}" \
  "$API/v1/env?teamId=$TEAM_ID")

error=$(echo "$response" | jq -r '.error.message // empty')
if [ -n "$error" ]; then
  echo "ERROR creating staging shared vars: $error"
  echo "$response" | jq .
else
  echo "Created $staging_count shared env vars for preview+development targets."
fi

echo ""
echo "=========================================="
echo "Step 3: Upload app-specific env vars"
echo "=========================================="

upload_project_env() {
  local project_id="$1"
  local project_name="$2"
  local prod_file="$3"
  local staging_file="$4"

  echo ""
  echo "--- $project_name ---"

  # Delete existing project env vars (paginated)
  del_count=0
  next=""
  while true; do
    if [ -z "$next" ]; then
      existing=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$API/v9/projects/$project_id/env?teamId=$TEAM_ID&limit=100")
    else
      existing=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "$API/v9/projects/$project_id/env?teamId=$TEAM_ID&limit=100&until=$next")
    fi

    ids=$(echo "$existing" | jq -r '.envs[]?.id // empty')
    if [ -z "$ids" ]; then
      break
    fi

    for id in $ids; do
      curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
        "$API/v9/projects/$project_id/env/$id?teamId=$TEAM_ID" > /dev/null
      del_count=$((del_count + 1))
    done

    next=$(echo "$existing" | jq -r '.pagination.next // empty')
    if [ -z "$next" ]; then
      break
    fi
  done

  if [ "$del_count" -gt 0 ]; then
    echo "  Deleted $del_count existing project env vars."
  fi

  # Production env vars (one at a time - project API requires top-level key/value)
  prod_count=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    value="${value#\"}"
    value="${value%\"}"
    escaped_value=$(echo -n "$value" | jq -Rs '.')

    response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$key\",\"value\":$escaped_value,\"type\":\"encrypted\",\"target\":[\"production\"]}" \
      "$API/v10/projects/$project_id/env?teamId=$TEAM_ID")

    error=$(echo "$response" | jq -r '.error.message // empty')
    if [ -n "$error" ]; then
      echo "  ERROR ($key production): $error"
    else
      prod_count=$((prod_count + 1))
    fi
  done < "$prod_file"
  echo "  Created $prod_count vars for production."

  # Staging env vars (preview + development)
  staging_count=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    key="${line%%=*}"
    value="${line#*=}"
    value="${value#\"}"
    value="${value%\"}"
    escaped_value=$(echo -n "$value" | jq -Rs '.')

    response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$key\",\"value\":$escaped_value,\"type\":\"encrypted\",\"target\":[\"preview\",\"development\"]}" \
      "$API/v10/projects/$project_id/env?teamId=$TEAM_ID")

    error=$(echo "$response" | jq -r '.error.message // empty')
    if [ -n "$error" ]; then
      echo "  ERROR ($key staging): $error"
    else
      staging_count=$((staging_count + 1))
    fi
  done < "$staging_file"
  echo "  Created $staging_count vars for preview+development."
}

upload_project_env "$WEB_PROJECT" "gymtext-web" \
  "$ENVS_DIR/web/production.env" "$ENVS_DIR/web/staging.env"

upload_project_env "$ADMIN_PROJECT" "gymtext-admin" \
  "$ENVS_DIR/admin/production.env" "$ENVS_DIR/admin/staging.env"

upload_project_env "$PROGRAMS_PROJECT" "gymtext-programs" \
  "$ENVS_DIR/programs/production.env" "$ENVS_DIR/programs/staging.env"

echo ""
echo "=========================================="
echo "DONE"
echo "=========================================="
echo ""
echo "Next step: Go to Vercel dashboard and link the shared team"
echo "env vars to each project manually."
