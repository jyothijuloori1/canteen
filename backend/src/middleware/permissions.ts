import { Request, Response, NextFunction } from 'express';
import { EntitySchema } from '../utils/schemaLoader';

export function checkPermission(
  schema: EntitySchema,
  action: 'read' | 'create' | 'update' | 'delete' | 'list',
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const permissions = schema.permissions[action];
  
  if (!permissions) {
    res.status(403).json({ error: `Action '${action}' not allowed for this entity` });
    return;
  }

  const user = req.user;
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;
  const isOwn = user && req.body?.created_by === user.email;

  // Check if action is allowed
  if (permissions.public) {
    next();
    return;
  }

  if (permissions.admin && isAdmin) {
    next();
    return;
  }

  if (permissions.authenticated && isAuthenticated) {
    next();
    return;
  }

  if (permissions.own && isOwn) {
    next();
    return;
  }

  res.status(403).json({ error: 'Permission denied' });
}

export function applyRowLevelSecurity(
  schema: EntitySchema,
  action: string,
  user: any,
  query: string,
  params: any[]
): { query: string; params: any[] } {
  // If admin, allow all
  if (user?.role === 'admin') {
    return { query, params };
  }

  // Apply row-level security based on permissions
  const permissions = schema.permissions[action as keyof typeof schema.permissions];
  
  if (permissions?.own && user) {
    // Add WHERE clause to filter by created_by
    const whereClause = query.includes('WHERE') ? 'AND' : 'WHERE';
    query += ` ${whereClause} created_by = $${params.length + 1}`;
    params.push(user.email);
  }

  return { query, params };
}
