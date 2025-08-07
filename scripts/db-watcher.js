#!/usr/bin/env node
/**
 * Database Schema Watcher
 * Monitors database schema changes and updates local documentation
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SCHEMA_FILE = path.join(__dirname, '..', 'docs', 'database', 'schema-introspection.json');
const TYPES_FILE = path.join(__dirname, '..', 'docs', 'database', 'database-types.ts');
const SERVICE_FILE = path.join(__dirname, '..', 'docs', 'database', 'database-service.ts');

class DatabaseWatcher {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async checkForChanges() {
    console.log('🔍 Checking for database schema changes...');
    
    try {
      // Load existing schema
      let existingSchema = {};
      if (fs.existsSync(SCHEMA_FILE)) {
        existingSchema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
      }

      // Get current schema
      const currentSchema = await this.getCurrentSchema();
      
      // Compare schemas
      const changes = this.compareSchemas(existingSchema, currentSchema);
      
      if (changes.hasChanges) {
        console.log('🔄 Database schema changes detected:');
        this.logChanges(changes);
        
        // Update documentation
        await this.updateDocumentation(currentSchema);
        
        console.log('✅ Documentation updated successfully!');
      } else {
        console.log('✅ No schema changes detected. Documentation is up to date.');
      }
      
      return changes;
      
    } catch (error) {
      console.error('❌ Error checking schema changes:', error);
      throw error;
    }
  }

  async getCurrentSchema() {
    // Reuse the introspection logic from the main script
    const tableNames = [
      'restaurants', 'categories', 'orders', 'order_items', 
      'tables', 'payments', 'suppliers', 'menu_items', 'users', 'profiles'
    ];

    const schema = {
      introspectionDate: new Date().toISOString(),
      database: 'supabase',
      schema: 'public',
      tables: {}
    };

    for (const tableName of tableNames) {
      try {
        const { data: sample } = await this.supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (sample && sample.length > 0) {
          const sampleRecord = sample[0];
          const columns = {};
          
          Object.entries(sampleRecord).forEach(([key, value]) => {
            columns[key] = {
              type: this.inferType(value),
              nullable: value === null
            };
          });

          schema.tables[tableName] = { columns };
        }
      } catch (error) {
        // Table doesn't exist or no access
      }
    }

    return schema;
  }

  inferType(value) {
    if (value === null) return 'nullable';
    if (typeof value === 'string') {
      if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return 'uuid';
      } else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return 'timestamp';
      } else {
        return 'text';
      }
    }
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object') return 'json';
    return 'unknown';
  }

  compareSchemas(oldSchema, newSchema) {
    const changes = {
      hasChanges: false,
      newTables: [],
      removedTables: [],
      modifiedTables: [],
      newColumns: {},
      removedColumns: {},
      modifiedColumns: {}
    };

    const oldTables = Object.keys(oldSchema.tables || {});
    const newTables = Object.keys(newSchema.tables || {});

    // Check for new tables
    changes.newTables = newTables.filter(table => !oldTables.includes(table));
    
    // Check for removed tables
    changes.removedTables = oldTables.filter(table => !newTables.includes(table));

    // Check for modified tables
    const commonTables = newTables.filter(table => oldTables.includes(table));
    
    commonTables.forEach(tableName => {
      const oldColumns = Object.keys(oldSchema.tables[tableName]?.columns || {});
      const newColumns = Object.keys(newSchema.tables[tableName]?.columns || {});
      
      const newCols = newColumns.filter(col => !oldColumns.includes(col));
      const removedCols = oldColumns.filter(col => !newColumns.includes(col));
      
      if (newCols.length > 0) {
        changes.newColumns[tableName] = newCols;
      }
      
      if (removedCols.length > 0) {
        changes.removedColumns[tableName] = removedCols;
      }
      
      if (newCols.length > 0 || removedCols.length > 0) {
        changes.modifiedTables.push(tableName);
      }
    });

    changes.hasChanges = changes.newTables.length > 0 || 
                        changes.removedTables.length > 0 || 
                        changes.modifiedTables.length > 0;

    return changes;
  }

  logChanges(changes) {
    if (changes.newTables.length > 0) {
      console.log(`  📋 New tables: ${changes.newTables.join(', ')}`);
    }
    
    if (changes.removedTables.length > 0) {
      console.log(`  🗑️  Removed tables: ${changes.removedTables.join(', ')}`);
    }
    
    if (changes.modifiedTables.length > 0) {
      console.log(`  🔧 Modified tables: ${changes.modifiedTables.join(', ')}`);
      
      Object.entries(changes.newColumns).forEach(([table, columns]) => {
        console.log(`    ➕ ${table}: new columns [${columns.join(', ')}]`);
      });
      
      Object.entries(changes.removedColumns).forEach(([table, columns]) => {
        console.log(`    ➖ ${table}: removed columns [${columns.join(', ')}]`);
      });
    }
  }

  async updateDocumentation(schema) {
    // Run the main introspection script
    const { execSync } = require('child_process');
    execSync('npm run db:introspect', { cwd: path.dirname(__dirname) });
  }

  // Watch for real-time changes (if needed)
  startWatching() {
    console.log('👀 Starting real-time database schema monitoring...');
    
    // Set up Supabase real-time subscription for schema changes
    // Note: This would require setting up triggers in the database
    // For now, we'll use polling
    
    setInterval(async () => {
      try {
        await this.checkForChanges();
      } catch (error) {
        console.error('Error during periodic schema check:', error);
      }
    }, 300000); // Check every 5 minutes
  }
}

// CLI interface
if (require.main === module) {
  const watcher = new DatabaseWatcher();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      watcher.checkForChanges();
      break;
    case 'watch':
      watcher.startWatching();
      break;
    default:
      console.log('Usage: node scripts/db-watcher.js [check|watch]');
      console.log('  check: Check for schema changes once');
      console.log('  watch: Start continuous monitoring');
  }
}

module.exports = DatabaseWatcher;
