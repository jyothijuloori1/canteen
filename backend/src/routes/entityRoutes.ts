import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { loadEntitySchemas, EntitySchema } from '../utils/schemaLoader';
import { validateEntityData, applyDefaults } from '../utils/validator';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { checkPermission, applyRowLevelSecurity } from '../middleware/permissions';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Load all entity schemas
const schemas = loadEntitySchemas();

// Auto-generate routes for each entity
schemas.forEach((schema, entityName) => {
  const basePath = `/entities/${entityName}`;

  // GET /entities/:entityName - List all (with filtering, sorting, pagination)
  router.get(
    basePath,
    optionalAuth,
    async (req: Request, res: Response) => {
      try {
        const user = req.user;
        const permissions = schema.permissions.list;
        
        if (!permissions) {
          res.status(403).json({ error: 'List operation not allowed' });
          return;
        }

        // Check permissions
        const isAdmin = user?.role === 'admin';
        const isAuthenticated = !!user;
        
        if (permissions.admin && !isAdmin) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }
        if (permissions.authenticated && !isAuthenticated) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        let sql = `SELECT * FROM ${schema.tableName}`;
        const params: any[] = [];
        const conditions: string[] = [];

        // Apply row-level security
        if (permissions.own && user && !isAdmin) {
          conditions.push(`created_by = $${params.length + 1}`);
          params.push(user.email);
        }

        // Apply filters from query params
        for (const [key, value] of Object.entries(req.query)) {
          if (key === 'sort' || key === 'limit' || key === 'offset') continue;
          if (schema.fields[key] || key === 'created_by') {
            conditions.push(`${key} = $${params.length + 1}`);
            params.push(value);
          }
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Sorting
        if (req.query.sort) {
          const sortField = (req.query.sort as string).startsWith('-')
            ? (req.query.sort as string).substring(1)
            : req.query.sort;
          const direction = (req.query.sort as string).startsWith('-') ? 'DESC' : 'ASC';
          if (schema.fields[sortField] || sortField === 'created_date' || sortField === 'updated_date') {
            sql += ` ORDER BY ${sortField} ${direction}`;
          }
        } else {
          sql += ' ORDER BY created_date DESC';
        }

        // Pagination
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
        sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        
        // Remove hidden fields
        const rows = result.rows.map(row => {
          const clean: any = {};
          for (const [key, fieldDef] of Object.entries(schema.fields)) {
            if (!fieldDef.hidden) {
              clean[key] = row[key];
            }
          }
          // Always include auto fields
          clean.id = row.id;
          clean.created_date = row.created_date;
          clean.updated_date = row.updated_date;
          clean.created_by = row.created_by;
          return clean;
        });

        res.json(rows);
      } catch (error: any) {
        console.error(`Error listing ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // GET /entities/:entityName/:id - Get single
  router.get(
    `${basePath}/:id`,
    optionalAuth,
    async (req: Request, res: Response) => {
      try {
        const user = req.user;
        const permissions = schema.permissions.read;
        
        if (!permissions) {
          res.status(403).json({ error: 'Read operation not allowed' });
          return;
        }

        const result = await query(
          `SELECT * FROM ${schema.tableName} WHERE id = $1`,
          [req.params.id]
        );

        if (result.rows.length === 0) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        const row = result.rows[0];

        // Check permissions
        const isAdmin = user?.role === 'admin';
        const isOwn = user && row.created_by === user.email;
        
        if (permissions.admin && !isAdmin && !isOwn) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }
        if (permissions.own && !isOwn && !isAdmin) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }

        // Remove hidden fields
        const clean: any = {};
        for (const [key, fieldDef] of Object.entries(schema.fields)) {
          if (!fieldDef.hidden) {
            clean[key] = row[key];
          }
        }
        clean.id = row.id;
        clean.created_date = row.created_date;
        clean.updated_date = row.updated_date;
        clean.created_by = row.created_by;

        res.json(clean);
      } catch (error: any) {
        console.error(`Error getting ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // POST /entities/:entityName - Create
  router.post(
    basePath,
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const permissions = schema.permissions.create;
        
        if (!permissions) {
          res.status(403).json({ error: 'Create operation not allowed' });
          return;
        }

        const isAdmin = req.user?.role === 'admin';
        const isAuthenticated = !!req.user;
        
        if (permissions.admin && !isAdmin) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }
        if (permissions.authenticated && !isAuthenticated) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        // Validate data
        const validation = validateEntityData(schema, req.body, false);
        if (!validation.valid) {
          res.status(400).json({ errors: validation.errors });
          return;
        }

        // Apply defaults
        let data = applyDefaults(schema, req.body);
        
        // Add auto fields
        data.id = uuidv4();
        data.created_date = new Date().toISOString();
        data.updated_date = new Date().toISOString();
        data.created_by = req.user!.email;

        // Build INSERT query
        const fields = Object.keys(data);
        const values = fields.map((_, i) => `$${i + 1}`);
        const sql = `INSERT INTO ${schema.tableName} (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;

        const result = await query(sql, fields.map(f => data[f]));

        // Remove hidden fields from response
        const row = result.rows[0];
        const clean: any = {};
        for (const [key, fieldDef] of Object.entries(schema.fields)) {
          if (!fieldDef.hidden) {
            clean[key] = row[key];
          }
        }
        clean.id = row.id;
        clean.created_date = row.created_date;
        clean.updated_date = row.updated_date;
        clean.created_by = row.created_by;

        res.status(201).json(clean);
      } catch (error: any) {
        console.error(`Error creating ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // POST /entities/:entityName/bulk - Bulk create
  router.post(
    `${basePath}/bulk`,
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const permissions = schema.permissions.create;
        if (!permissions || (!permissions.admin && req.user?.role !== 'admin')) {
          res.status(403).json({ error: 'Bulk create requires admin access' });
          return;
        }

        const items = Array.isArray(req.body) ? req.body : [];
        const results = [];

        for (const item of items) {
          const validation = validateEntityData(schema, item, false);
          if (!validation.valid) {
            continue;
          }

          let data = applyDefaults(schema, item);
          data.id = uuidv4();
          data.created_date = new Date().toISOString();
          data.updated_date = new Date().toISOString();
          data.created_by = req.user!.email;

          const fields = Object.keys(data);
          const values = fields.map((_, i) => `$${i + 1}`);
          const sql = `INSERT INTO ${schema.tableName} (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;

          const result = await query(sql, fields.map(f => data[f]));
          results.push(result.rows[0]);
        }

        res.status(201).json(results);
      } catch (error: any) {
        console.error(`Error bulk creating ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // PUT /entities/:entityName/:id - Update
  router.put(
    `${basePath}/:id`,
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const permissions = schema.permissions.update;
        
        if (!permissions) {
          res.status(403).json({ error: 'Update operation not allowed' });
          return;
        }

        // Check if record exists
        const existing = await query(
          `SELECT * FROM ${schema.tableName} WHERE id = $1`,
          [req.params.id]
        );

        if (existing.rows.length === 0) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        const row = existing.rows[0];
        const isAdmin = req.user?.role === 'admin';
        const isOwn = req.user && row.created_by === req.user.email;

        if (permissions.admin && !isAdmin && !isOwn) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }
        if (permissions.own && !isOwn && !isAdmin) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }

        // Validate update data
        const validation = validateEntityData(schema, req.body, true);
        if (!validation.valid) {
          res.status(400).json({ errors: validation.errors });
          return;
        }

        // Build UPDATE query
        const updates: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(req.body)) {
          if (key === 'id' || key === 'created_date' || key === 'created_by') continue;
          if (schema.fields[key]) {
            updates.push(`${key} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
          }
        }

        if (updates.length === 0) {
          res.status(400).json({ error: 'No valid fields to update' });
          return;
        }

        updates.push(`updated_date = $${paramIndex}`);
        params.push(new Date().toISOString());
        paramIndex++;
        params.push(req.params.id);

        const sql = `UPDATE ${schema.tableName} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await query(sql, params);

        // Remove hidden fields
        const clean: any = {};
        for (const [key, fieldDef] of Object.entries(schema.fields)) {
          if (!fieldDef.hidden) {
            clean[key] = result.rows[0][key];
          }
        }
        clean.id = result.rows[0].id;
        clean.created_date = result.rows[0].created_date;
        clean.updated_date = result.rows[0].updated_date;
        clean.created_by = result.rows[0].created_by;

        res.json(clean);
      } catch (error: any) {
        console.error(`Error updating ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // DELETE /entities/:entityName/:id - Delete
  router.delete(
    `${basePath}/:id`,
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const permissions = schema.permissions.delete;
        
        if (!permissions) {
          res.status(403).json({ error: 'Delete operation not allowed' });
          return;
        }

        const existing = await query(
          `SELECT * FROM ${schema.tableName} WHERE id = $1`,
          [req.params.id]
        );

        if (existing.rows.length === 0) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        const row = existing.rows[0];
        const isAdmin = req.user?.role === 'admin';
        const isOwn = req.user && row.created_by === req.user.email;

        if (permissions.admin && !isAdmin && !isOwn) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }
        if (permissions.own && !isOwn && !isAdmin) {
          res.status(403).json({ error: 'Permission denied' });
          return;
        }

        await query(`DELETE FROM ${schema.tableName} WHERE id = $1`, [req.params.id]);
        res.status(204).send();
      } catch (error: any) {
        console.error(`Error deleting ${entityName}:`, error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // GET /entities/:entityName/schema - Get schema
  router.get(`${basePath}/schema`, (req: Request, res: Response) => {
    res.json(schema);
  });
});

export default router;
