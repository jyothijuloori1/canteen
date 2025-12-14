import { query } from '../config/database';
import { loadEntitySchemas } from '../utils/schemaLoader';

function getPostgresType(fieldType: string, fieldDef: any): string {
  switch (fieldType) {
    case 'string':
      if (fieldDef.format === 'email') return 'VARCHAR(255)';
      if (fieldDef.format === 'date') return 'DATE';
      return 'TEXT';
    case 'number':
      return 'DECIMAL(10, 2)';
    case 'boolean':
      return 'BOOLEAN';
    case 'json':
      return 'JSONB';
    default:
      return 'TEXT';
  }
}

async function createTable(schema: any) {
  const columns: string[] = [
    'id UUID PRIMARY KEY',
    'created_date TIMESTAMP NOT NULL DEFAULT NOW()',
    'updated_date TIMESTAMP NOT NULL DEFAULT NOW()',
    'created_by VARCHAR(255)',
  ];

  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    const pgType = getPostgresType(fieldDef.type, fieldDef);
    let columnDef = `${fieldName} ${pgType}`;

    if (fieldDef.required) {
      columnDef += ' NOT NULL';
    }

    if (fieldDef.default !== undefined) {
      if (typeof fieldDef.default === 'string') {
        columnDef += ` DEFAULT '${fieldDef.default}'`;
      } else {
        columnDef += ` DEFAULT ${fieldDef.default}`;
      }
    }

    if (fieldDef.unique) {
      columnDef += ' UNIQUE';
    }

    columns.push(columnDef);
  }

  const sql = `CREATE TABLE IF NOT EXISTS ${schema.tableName} (
    ${columns.join(',\n    ')}
  )`;

  await query(sql);
  console.log(`✅ Created table: ${schema.tableName}`);

  // Create indexes
  if (schema.fields.created_by) {
    await query(
      `CREATE INDEX IF NOT EXISTS idx_${schema.tableName}_created_by ON ${schema.tableName}(created_by)`
    );
  }
  await query(
    `CREATE INDEX IF NOT EXISTS idx_${schema.tableName}_created_date ON ${schema.tableName}(created_date)`
  );
}

export async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    const schemas = loadEntitySchemas();

    for (const [entityName, schema] of schemas) {
      await createTable(schema);
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
