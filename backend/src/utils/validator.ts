import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { EntitySchema, EntityField } from './schemaLoader';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export function validateEntityData(
  schema: EntitySchema,
  data: any,
  isUpdate: boolean = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields (only for create, not update)
  if (!isUpdate) {
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      if (fieldDef.required && (data[fieldName] === undefined || data[fieldName] === null)) {
        errors.push(`Field '${fieldName}' is required`);
      }
    }
  }

  // Validate field types and constraints
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    const value = data[fieldName];
    
    if (value === undefined || value === null) {
      if (!isUpdate || fieldDef.required) continue;
      continue;
    }

    // Type validation
    switch (fieldDef.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field '${fieldName}' must be a string`);
        } else {
          if (fieldDef.minLength && value.length < fieldDef.minLength) {
            errors.push(`Field '${fieldName}' must be at least ${fieldDef.minLength} characters`);
          }
          if (fieldDef.enum && !fieldDef.enum.includes(value)) {
            errors.push(`Field '${fieldName}' must be one of: ${fieldDef.enum.join(', ')}`);
          }
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`Field '${fieldName}' must be a number`);
        } else {
          if (fieldDef.minimum !== undefined && value < fieldDef.minimum) {
            errors.push(`Field '${fieldName}' must be at least ${fieldDef.minimum}`);
          }
          if (fieldDef.maximum !== undefined && value > fieldDef.maximum) {
            errors.push(`Field '${fieldName}' must be at most ${fieldDef.maximum}`);
          }
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Field '${fieldName}' must be a boolean`);
        }
        break;
      case 'json':
        // JSON fields are validated as objects/arrays
        if (typeof value !== 'object') {
          errors.push(`Field '${fieldName}' must be a valid JSON object or array`);
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function applyDefaults(schema: EntitySchema, data: any): any {
  const result = { ...data };
  
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (result[fieldName] === undefined && fieldDef.default !== undefined) {
      result[fieldName] = fieldDef.default;
    }
  }
  
  return result;
}
