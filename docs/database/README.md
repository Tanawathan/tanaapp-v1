# Database Analysis and Schema Management

This directory contains the database schema documentation and analysis tools.

## Files

- `schema-introspection.json` - Complete database schema in JSON format
- `database-types.ts` - TypeScript interfaces generated from database schema
- `current-schema.md` - Human-readable database documentation

## Usage

Run the database introspection to update all files:

```bash
npm run db:introspect
```

This will connect to Supabase and generate updated schema documentation based on the current database state.
