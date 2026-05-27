const { sequelize } = require('./models');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // 1. Convert all problematic ENUM columns to standard VARCHAR
    // This stops the "cannot cast" errors forever
    const commands = [
      'ALTER TABLE "users" ALTER COLUMN "role" TYPE VARCHAR(255);',
      'ALTER TABLE "jobs" ALTER COLUMN "job_type" TYPE VARCHAR(255);',
      'ALTER TABLE "jobs" ALTER COLUMN "work_mode" TYPE VARCHAR(255);',
      'ALTER TABLE "applications" ALTER COLUMN "status" TYPE VARCHAR(255);',
      'ALTER TABLE "profiles" ALTER COLUMN "work_mode_preference" TYPE VARCHAR(255);',

      // 2. Ensure critical columns exist
      'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "profile_completion_percentage" INTEGER DEFAULT 0;',
      'ALTER TABLE "employers" ADD COLUMN IF NOT EXISTS "profile_completion_percentage" INTEGER DEFAULT 0;',
      'ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255) DEFAULT \'Technology\';',
      'ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "notes" TEXT;',
      'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "years_of_experience" INTEGER;',
      'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "expected_salary" INTEGER;',
      'ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "skills" TEXT;'
    ];

    for (const sql of commands) {
      try {
        await sequelize.query(sql);
        console.log(`Executed: ${sql.substring(0, 50)}...`);
      } catch (e) {
        console.log(`Skipped/Error on: ${sql.substring(0, 50)}... (${e.message})`);
      }
    }

    console.log('✅ Database fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err);
    process.exit(1);
  }
}

fix();
