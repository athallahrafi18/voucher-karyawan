const pool = require('../config/database');

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');

    // Create vouchers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id SERIAL PRIMARY KEY,
        barcode VARCHAR(50) UNIQUE NOT NULL,
        voucher_number VARCHAR(10) NOT NULL,
        nominal INTEGER DEFAULT 10000,
        company_name VARCHAR(100) DEFAULT 'Rakan Kuphi',
        issue_date DATE NOT NULL,
        valid_until DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
        redeemed_at TIMESTAMP,
        redeemed_by VARCHAR(100),
        tenant_used VARCHAR(100) CHECK (tenant_used IN ('Martabak Rakan', 'Mie Aceh Rakan')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_barcode ON vouchers(barcode)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_issue_date ON vouchers(issue_date)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status)
    `);

    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

