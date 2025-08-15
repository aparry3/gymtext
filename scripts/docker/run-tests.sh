#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting test environment...${NC}"

# Start PostgreSQL container
docker-compose -f docker-compose.test.yml up -d

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
until docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo -e "${GREEN}PostgreSQL is ready!${NC}"

# Update database URL to use containerized PostgreSQL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gymtext_test"
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gymtext_test"

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
pnpm migrate:up

# Run tests based on argument
if [ "$1" = "unit" ]; then
  echo -e "${GREEN}Running unit tests...${NC}"
  pnpm test:unit
elif [ "$1" = "integration" ]; then
  echo -e "${GREEN}Running integration tests...${NC}"
  pnpm test:integration
elif [ "$1" = "watch" ]; then
  echo -e "${GREEN}Running tests in watch mode...${NC}"
  pnpm test:watch
elif [ "$1" = "coverage" ]; then
  echo -e "${GREEN}Running tests with coverage...${NC}"
  pnpm test:coverage
else
  echo -e "${GREEN}Running all tests...${NC}"
  pnpm test
fi

# Store exit code
TEST_EXIT_CODE=$?

# Cleanup based on environment variable or second argument
if [ "$2" != "keep" ] && [ "$KEEP_TEST_DB" != "true" ]; then
  echo -e "${YELLOW}Stopping test environment...${NC}"
  docker-compose -f docker-compose.test.yml down
else
  echo -e "${YELLOW}Keeping test environment running (use 'docker-compose -f docker-compose.test.yml down' to stop)${NC}"
fi

exit $TEST_EXIT_CODE