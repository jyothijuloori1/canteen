import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full_name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password, full_name, role, wallet_balance, profile_complete, created_date, updated_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $2)`,
      [userId, email, hashedPassword, full_name, 'student', 0, false]
    );

    // Generate token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign({ userId, email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        full_name,
        role: 'student',
        wallet_balance: 0,
        profile_complete: false,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const result = await query(
      'SELECT id, email, password, full_name, role, wallet_balance, profile_complete FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        wallet_balance: user.wallet_balance,
        profile_complete: user.profile_complete,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, wallet_balance, profile_complete, roll_number, year, branch, phone FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      wallet_balance: user.wallet_balance,
      profile_complete: user.profile_complete,
      roll_number: user.roll_number,
      year: user.year,
      branch: user.branch,
      phone: user.phone,
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update current user
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['full_name', 'roll_number', 'year', 'branch', 'phone', 'profile_complete', 'wallet_balance'];

    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    updates.push(`updated_date = NOW()`);
    params.push(req.user!.id);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sql, params);

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      wallet_balance: user.wallet_balance,
      profile_complete: user.profile_complete,
      roll_number: user.roll_number,
      year: user.year,
      branch: user.branch,
      phone: user.phone,
    });
  } catch (error: any) {
    console.error('Update me error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check authentication
router.get('/is-authenticated', authenticateToken, (req: Request, res: Response) => {
  res.json({ authenticated: true, user: req.user });
});

export default router;
