---
name: read-db
description: Explore and query a PostgreSQL/Neon database using readonly credentials. Use when the user asks questions about their database, needs to find data, wants to understand table structures, or needs help writing queries. Triggers on mentions of database, tables, schemas, SQL, records, or data exploration.
---

# Neon Database Query Skill

Query and explore a PostgreSQL database (Neon) using readonly credentials stored in `.env.readonly`.

## Setup

Load the connection string before running any queries:

```bash
export DATABASE_URL=$(grep DATABASE_URL .env.readonly | cut -d '=' -f2-)
```

## Workflow

When asked a question about the database, follow this process:

1. **Discover tables** - See what tables exist
2. **Examine schemas** - Understand relevant table structures  
3. **Check relationships** - Look at foreign keys if joining is needed
4. **Sample data** - Preview with LIMIT to understand the data
5. **Construct query** - Build the appropriate query
6. **Execute and explain** - Run the query and interpret results

## Database Exploration

### List all tables

```bash
psql "$DATABASE_URL" -c "\dt"
```

### Get table schema

```bash
psql "$DATABASE_URL" -c "\d table_name"
```

### View foreign key relationships

```bash
psql "$DATABASE_URL" -c "
SELECT
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
"
```

### View enums and custom types

```bash
psql "$DATABASE_URL" -c "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder;"
```

### Get row counts for all tables

```bash
psql "$DATABASE_URL" -c "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

### Search for columns by name

```bash
psql "$DATABASE_URL" -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE column_name LIKE '%search_term%' AND table_schema = 'public';"
```

## Querying Data

### Basic query with limit

```bash
psql "$DATABASE_URL" -c "SELECT * FROM table_name LIMIT 10;"
```

### Count records

```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM table_name;"
```

### Export to CSV

```bash
psql "$DATABASE_URL" -c "\copy (SELECT * FROM table_name) TO STDOUT WITH CSV HEADER"
```

## Important Notes

- This is a **readonly** connection - only SELECT queries will work
- Always use `LIMIT` when exploring to avoid overwhelming output
- Neon databases may have cold start delays on first connection
- For large result sets, use aggregations or sampling
