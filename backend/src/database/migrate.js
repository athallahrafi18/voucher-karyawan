const pool = require('../config/database');

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');

    // Create employees table (master data)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        employee_code VARCHAR(20) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create vouchers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id SERIAL PRIMARY KEY,
        voucher_code VARCHAR(20) UNIQUE NOT NULL,
        barcode VARCHAR(50) UNIQUE NOT NULL,
        voucher_number VARCHAR(10) NOT NULL,
        nominal INTEGER DEFAULT 10000,
        company_name VARCHAR(100) DEFAULT 'Rakan Kuphi',
        issue_date DATE NOT NULL,
        valid_until DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
        employee_id INTEGER REFERENCES employees(id),
        employee_name VARCHAR(100),
        redeemed_at TIMESTAMP,
        redeemed_by VARCHAR(100),
        tenant_used VARCHAR(100) CHECK (tenant_used IN ('Martabak Rakan', 'Mie Aceh Rakan')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    await pool.query(`
      DO $$ 
      BEGIN
        -- Add employee_id if not exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'vouchers' AND column_name = 'employee_id'
        ) THEN
          ALTER TABLE vouchers ADD COLUMN employee_id INTEGER;
        END IF;
        
        -- Add voucher_code if not exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'vouchers' AND column_name = 'voucher_code'
        ) THEN
          ALTER TABLE vouchers ADD COLUMN voucher_code VARCHAR(20);
          -- Make it unique
          CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_voucher_code ON vouchers(voucher_code);
        END IF;
        
        -- Add employee_name if not exists
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'vouchers' AND column_name = 'employee_name'
        ) THEN
          ALTER TABLE vouchers ADD COLUMN employee_name VARCHAR(100);
        END IF;
      END $$;
    `);

    // Create indexes for vouchers
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_barcode ON vouchers(barcode)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_code ON vouchers(voucher_code)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_issue_date ON vouchers(issue_date)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_employee_date ON vouchers(employee_id, issue_date)
    `);

    // Create indexes for employees
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code)
    `);

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

