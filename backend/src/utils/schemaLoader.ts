import fs from 'fs';
import path from 'path';

export interface EntityField {
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
  enum?: string[];
  format?: string;
  minLength?: number;
  minimum?: number;
  maximum?: number;
  hidden?: boolean;
}

export interface EntitySchema {
  name: string;
  tableName: string;
  fields: Record<string, EntityField>;
  permissions: {
    read?: { own?: boolean; admin?: boolean; authenticated?: boolean };
    create?: { public?: boolean; authenticated?: boolean; admin?: boolean };
    update?: { own?: boolean; admin?: boolean };
    delete?: { own?: boolean; admin?: boolean };
    list?: { own?: boolean; admin?: boolean; authenticated?: boolean };
  };
}

export function loadEntitySchemas(): Map<string, EntitySchema> {
  const entitiesDir = path.join(__dirname, '../../entities');
  const schemas = new Map<string, EntitySchema>();

  if (!fs.existsSync(entitiesDir)) {
    throw new Error(`Entities directory not found: ${entitiesDir}`);
  }

  const files = fs.readdirSync(entitiesDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(entitiesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const schema: EntitySchema = JSON.parse(content);
      schemas.set(schema.name, schema);
      console.log(`✅ Loaded entity schema: ${schema.name}`);
    }
  }

  return schemas;
}

export function getEntitySchema(entityName: string): EntitySchema | null {
  const schemas = loadEntitySchemas();
  return schemas.get(entityName) || null;
}
