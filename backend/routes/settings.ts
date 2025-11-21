import { Router } from 'express';
import { requireAuth, requireOperator, AuthRequest } from '../middleware/auth';
import prisma from '../db/connection';

const router = Router();

/**
 * GET /settings/business
 * Get business settings
 */
router.get('/business', requireAuth, async (req: AuthRequest, res) => {
  try {
    // For now, store settings in a simple key-value table or JSON field
    // We'll use a simple approach: one settings record per business
    const settings = await prisma.$queryRaw`
      SELECT * FROM business_settings LIMIT 1
    `.catch(() => null);

    if (!settings) {
      // Return defaults if no settings exist
      return res.json({
        maxStaffCapacity: 7,
        optimalStaffMin: 5,
        optimalStaffMax: 7,
        maxFrontOfHouse: 3,
        maxBackOfHouse: 4,
        standardOpenTime: '07:00',
        standardCloseTime: '15:00',
        averageHourlyWage: 15,
        overtimeThreshold: 40,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return defaults on error
    res.json({
      maxStaffCapacity: 7,
      optimalStaffMin: 5,
      optimalStaffMax: 7,
      maxFrontOfHouse: 3,
      maxBackOfHouse: 4,
      standardOpenTime: '07:00',
      standardCloseTime: '15:00',
      averageHourlyWage: 15,
      overtimeThreshold: 40,
    });
  }
});

/**
 * POST /settings/business
 * Update business settings (operators only)
 */
router.post('/business', requireAuth, requireOperator, async (req: AuthRequest, res) => {
  try {
    const {
      maxStaffCapacity,
      optimalStaffMin,
      optimalStaffMax,
      maxFrontOfHouse,
      maxBackOfHouse,
      standardOpenTime,
      standardCloseTime,
      averageHourlyWage,
      overtimeThreshold,
    } = req.body;

    // For simplicity, we'll store in a JSON field on the user or create a settings table
    // Using a simple approach with raw SQL for now
    await prisma.$executeRaw`
      INSERT INTO business_settings (
        id,
        max_staff_capacity,
        optimal_staff_min,
        optimal_staff_max,
        max_front_of_house,
        max_back_of_house,
        standard_open_time,
        standard_close_time,
        average_hourly_wage,
        overtime_threshold,
        updated_at
      ) VALUES (
        'default',
        ${maxStaffCapacity},
        ${optimalStaffMin},
        ${optimalStaffMax},
        ${maxFrontOfHouse},
        ${maxBackOfHouse},
        ${standardOpenTime},
        ${standardCloseTime},
        ${averageHourlyWage},
        ${overtimeThreshold},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        max_staff_capacity = ${maxStaffCapacity},
        optimal_staff_min = ${optimalStaffMin},
        optimal_staff_max = ${optimalStaffMax},
        max_front_of_house = ${maxFrontOfHouse},
        max_back_of_house = ${maxBackOfHouse},
        standard_open_time = ${standardOpenTime},
        standard_close_time = ${standardCloseTime},
        average_hourly_wage = ${averageHourlyWage},
        overtime_threshold = ${overtimeThreshold},
        updated_at = NOW()
    `.catch(async () => {
      // If table doesn't exist, create it
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS business_settings (
          id TEXT PRIMARY KEY,
          max_staff_capacity INTEGER NOT NULL DEFAULT 7,
          optimal_staff_min INTEGER NOT NULL DEFAULT 5,
          optimal_staff_max INTEGER NOT NULL DEFAULT 7,
          max_front_of_house INTEGER NOT NULL DEFAULT 3,
          max_back_of_house INTEGER NOT NULL DEFAULT 4,
          standard_open_time TEXT NOT NULL DEFAULT '07:00',
          standard_close_time TEXT NOT NULL DEFAULT '15:00',
          average_hourly_wage DECIMAL(10,2) NOT NULL DEFAULT 15.00,
          overtime_threshold INTEGER NOT NULL DEFAULT 40,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      // Try insert again
      await prisma.$executeRaw`
        INSERT INTO business_settings (
          id,
          max_staff_capacity,
          optimal_staff_min,
          optimal_staff_max,
          max_front_of_house,
          max_back_of_house,
          standard_open_time,
          standard_close_time,
          average_hourly_wage,
          overtime_threshold
        ) VALUES (
          'default',
          ${maxStaffCapacity},
          ${optimalStaffMin},
          ${optimalStaffMax},
          ${maxFrontOfHouse},
          ${maxBackOfHouse},
          ${standardOpenTime},
          ${standardCloseTime},
          ${averageHourlyWage},
          ${overtimeThreshold}
        )
      `;
    });

    res.json(req.body);
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;
