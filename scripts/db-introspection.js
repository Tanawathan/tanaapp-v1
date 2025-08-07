require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function introspectDatabase() {
  console.log('🔍 Starting database introspection...');
  
  try {
    // First, let's try to get tables using a direct SQL query
    const { data: tablesResult, error: tablesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

    // If RPC doesn't work, try alternative method by listing known tables
    let tableNames = [];
    
    if (tablesError) {
      console.log('ℹ️  RPC method failed, trying alternative approach...');
      
      // Try to query common table names that might exist
      const commonTableNames = [
        'restaurants', 'users', 'profiles', 'menu_items', 'categories', 
        'orders', 'order_items', 'tables', 'customers', 'staff',
        'payments', 'inventory', 'suppliers', 'purchases', 'reviews',
        'promotions', 'analytics', 'settings', 'notifications'
      ];
      
      for (const tableName of commonTableNames) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (!error) {
            tableNames.push({ table_name: tableName });
            console.log(`✅ Found table: ${tableName}`);
          }
        } catch (e) {
          // Table doesn't exist, continue
        }
      }
    } else {
      tableNames = tablesResult;
    }

    console.log(`📋 Found ${tableNames.length} tables`);

    const databaseSchema = {
      introspectionDate: new Date().toISOString(),
      database: 'supabase',
      schema: 'public',
      tables: {}
    };

    // Get detailed information for each table
    for (const table of tableNames) {
      const tableName = table.table_name;
      console.log(`📊 Analyzing table: ${tableName}`);

      try {
        // Get a sample record to understand the data structure
        const { data: sample, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!sampleError && sample && sample.length > 0) {
          const sampleRecord = sample[0];
          const columns = {};
          
          // Analyze the sample record to infer column types
          Object.entries(sampleRecord).forEach(([key, value]) => {
            let type = 'unknown';
            if (value === null) {
              type = 'nullable';
            } else if (typeof value === 'string') {
              // Check if it's a UUID, date, or regular string
              if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                type = 'uuid';
              } else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                type = 'timestamp';
              } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                type = 'date';
              } else {
                type = 'text';
              }
            } else if (typeof value === 'number') {
              type = Number.isInteger(value) ? 'integer' : 'decimal';
            } else if (typeof value === 'boolean') {
              type = 'boolean';
            } else if (typeof value === 'object') {
              type = 'json';
            }
            
            columns[key] = {
              type: type,
              nullable: value === null,
              sampleValue: value
            };
          });

          databaseSchema.tables[tableName] = {
            columns: columns,
            sampleData: sampleRecord,
            recordCount: sample.length
          };
          
          // Try to get total count
          try {
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            if (count !== null) {
              databaseSchema.tables[tableName].totalRecords = count;
            }
          } catch (countError) {
            console.log(`ℹ️  Could not get count for ${tableName}`);
          }
          
        } else {
          // Table exists but is empty, try to get structure info differently
          console.log(`ℹ️  Table ${tableName} is empty, trying alternative structure detection`);
          
          // Try to insert a test record to see what fields are required
          databaseSchema.tables[tableName] = {
            columns: {},
            isEmpty: true,
            note: 'Table exists but contains no data'
          };
        }

      } catch (tableError) {
        console.log(`⚠️  Could not analyze table ${tableName}:`, tableError.message);
        databaseSchema.tables[tableName] = {
          error: tableError.message,
          accessible: false
        };
      }
    }

    // Create database documentation directory
    const docsDir = path.join(__dirname, '..', 'docs');
    const dbDir = path.join(docsDir, 'database');
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Save the schema to JSON file
    const schemaPath = path.join(dbDir, 'schema-introspection.json');
    fs.writeFileSync(schemaPath, JSON.stringify(databaseSchema, null, 2));

    // Generate TypeScript interfaces
    const typesContent = generateTypeScriptInterfaces(databaseSchema);
    const typesPath = path.join(dbDir, 'database-types.ts');
    fs.writeFileSync(typesPath, typesContent);

    // Generate markdown documentation
    const markdownContent = generateMarkdownDocumentation(databaseSchema);
    const markdownPath = path.join(dbDir, 'current-schema.md');
    fs.writeFileSync(markdownPath, markdownContent);

    console.log('✅ Database introspection completed!');
    console.log(`📁 Files created:`);
    console.log(`   - ${schemaPath}`);
    console.log(`   - ${typesPath}`);
    console.log(`   - ${markdownPath}`);
    
    // Display summary
    const tableCount = Object.keys(databaseSchema.tables).length;
    const accessibleTables = Object.values(databaseSchema.tables).filter(t => !t.error).length;
    console.log(`\n📊 Summary:`);
    console.log(`   - Total tables found: ${tableCount}`);
    console.log(`   - Accessible tables: ${accessibleTables}`);
    console.log(`   - Tables with data: ${Object.values(databaseSchema.tables).filter(t => t.sampleData).length}`);

  } catch (error) {
    console.error('❌ Error during database introspection:', error);
  }
}

function generateTypeScriptInterfaces(schema) {
  let content = `// Database Types - Generated on ${schema.introspectionDate}\n`;
  content += `// This file is auto-generated. Do not edit manually.\n\n`;

  Object.entries(schema.tables).forEach(([tableName, tableInfo]) => {
    const interfaceName = toPascalCase(tableName);
    content += `export interface ${interfaceName} {\n`;
    
    if (tableInfo.columns) {
      Object.entries(tableInfo.columns).forEach(([columnName, columnInfo]) => {
        const optional = columnInfo.nullable ? '?' : '';
        const tsType = mapPostgresToTypeScript(columnInfo.type);
        content += `  ${columnName}${optional}: ${tsType};\n`;
      });
    }
    
    content += `}\n\n`;

    // Generate insert type (without auto-generated fields)
    content += `export interface ${interfaceName}Insert {\n`;
    if (tableInfo.columns) {
      Object.entries(tableInfo.columns).forEach(([columnName, columnInfo]) => {
        // Skip auto-generated columns like id, created_at, updated_at
        if (columnName === 'id' || columnName === 'created_at' || columnName === 'updated_at') {
          return;
        }
        const optional = columnInfo.nullable || columnInfo.default ? '?' : '';
        const tsType = mapPostgresToTypeScript(columnInfo.type);
        content += `  ${columnName}${optional}: ${tsType};\n`;
      });
    }
    content += `}\n\n`;
  });

  return content;
}

function generateMarkdownDocumentation(schema) {
  let content = `# Database Schema Documentation\n\n`;
  content += `**Generated:** ${new Date(schema.introspectionDate).toLocaleString()}\n`;
  content += `**Database:** ${schema.database}\n`;
  content += `**Schema:** ${schema.schema}\n\n`;

  content += `## Tables Overview\n\n`;
  content += `Total tables: ${Object.keys(schema.tables).length}\n\n`;

  Object.entries(schema.tables).forEach(([tableName, tableInfo]) => {
    content += `### ${tableName}\n\n`;
    
    if (tableInfo.columns) {
      content += `| Column | Type | Nullable | Default |\n`;
      content += `|--------|------|----------|----------|\n`;
      
      Object.entries(tableInfo.columns).forEach(([columnName, columnInfo]) => {
        const nullable = columnInfo.nullable ? '✅' : '❌';
        const defaultValue = columnInfo.default || '-';
        content += `| ${columnName} | ${columnInfo.type} | ${nullable} | ${defaultValue} |\n`;
      });
      
      content += `\n`;
    }

    if (tableInfo.primaryKeys && tableInfo.primaryKeys.length > 0) {
      content += `**Primary Keys:** ${tableInfo.primaryKeys.join(', ')}\n\n`;
    }

    if (tableInfo.sampleData) {
      content += `**Sample Data Structure:**\n\`\`\`json\n${JSON.stringify(tableInfo.sampleData, null, 2)}\n\`\`\`\n\n`;
    }

    content += `---\n\n`;
  });

  return content;
}

function mapPostgresToTypeScript(pgType) {
  const typeMap = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'serial': 'number',
    'bigserial': 'number',
    'text': 'string',
    'varchar': 'string',
    'character varying': 'string',
    'char': 'string',
    'character': 'string',
    'boolean': 'boolean',
    'timestamp': 'string',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'time': 'string',
    'uuid': 'string',
    'json': 'any',
    'jsonb': 'any',
    'array': 'any[]',
    'bytea': 'string'
  };

  return typeMap[pgType] || 'any';
}

function toPascalCase(str) {
  return str.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Run the introspection
introspectDatabase();
