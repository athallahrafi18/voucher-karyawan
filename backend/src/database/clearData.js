const pool = require('../config/database');

async function clearData() {
  try {
    console.log('⚠️  WARNING: This will delete ALL data from vouchers and employees tables!');
    console.log('🔄 Clearing old data...');

    // Check if tables exist and clear them
    const checkTable = async (tableName) => {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );
      return result.rows[0].exists;
    };

    // Clear vouchers table (if exists)
    const vouchersExists = await checkTable('vouchers');
    if (vouchersExists) {
      await pool.query('TRUNCATE TABLE vouchers CASCADE');
      console.log('✅ Vouchers table cleared');
    } else {
      console.log('ℹ️  Vouchers table does not exist, skipping...');
    }

    // Clear employees table (if exists)
    const employeesExists = await checkTable('employees');
    if (employeesExists) {
      await pool.query('TRUNCATE TABLE employees CASCADE');
      console.log('✅ Employees table cleared');
    } else {
      console.log('ℹ️  Employees table does not exist, skipping...');
    }

    // Reset sequences (if tables exist)
    if (vouchersExists) {
      try {
        await pool.query('ALTER SEQUENCE vouchers_id_seq RESTART WITH 1');
        console.log('✅ Vouchers sequence reset');
      } catch (err) {
        // Sequence might not exist, ignore
        console.log('ℹ️  Vouchers sequence not found, skipping...');
      }
    }

    if (employeesExists) {
      try {
        await pool.query('ALTER SEQUENCE employees_id_seq RESTART WITH 1');
        console.log('✅ Employees sequence reset');
      } catch (err) {
        // Sequence might not exist, ignore
        console.log('ℹ️  Employees sequence not found, skipping...');
      }
    }

    console.log('✅ Clear data operation completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearData();

