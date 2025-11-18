const pool = require('../config/database');

async function clearData() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from vouchers and employees tables!');
    console.log('🔄 Clearing old data...');

    // Clear vouchers table
    await pool.query('TRUNCATE TABLE vouchers CASCADE');
    console.log('✅ Vouchers table cleared');

    // Clear employees table
    await pool.query('TRUNCATE TABLE employees CASCADE');
    console.log('✅ Employees table cleared');

    // Reset sequences (optional, but good practice)
    await pool.query('ALTER SEQUENCE vouchers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE employees_id_seq RESTART WITH 1');
    console.log('✅ Sequences reset');

    console.log('✅ All data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearData();

