const { sequelize } = require('./models');

async function reset() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to DB.');

    // 1. Drop profiles to start fresh
    console.log('Dropping old profiles table...');
    await sequelize.query('DROP TABLE IF EXISTS "profiles" CASCADE;');

    // 2. Ensure User columns are standard
    console.log('Fixing users table...');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(255);');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(255);');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN DEFAULT FALSE;');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" VARCHAR(255) DEFAULT \'student\';');

    // 3. Create fresh profiles and employers table from scratch
    console.log('Creating fresh tables...');
    await sequelize.query('DROP TABLE IF EXISTS "employers" CASCADE;');

    await sequelize.query(`
      CREATE TABLE "profiles" (
        "id" SERIAL PRIMARY KEY,
        "university" VARCHAR(255),
        "course_of_study" VARCHAR(255),
        "bio" TEXT,
        "resume_url" VARCHAR(255),
        "location_preference" VARCHAR(255),
        "profile_completion_percentage" INTEGER DEFAULT 0,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sequelize.query(`
      CREATE TABLE "employers" (
        "id" SERIAL PRIMARY KEY,
        "company_name" VARCHAR(255) NOT NULL,
        "company_logo" VARCHAR(255),
        "description" TEXT,
        "website" VARCHAR(255),
        "industry" VARCHAR(100),
        "company_size" VARCHAR(50),
        "is_verified" BOOLEAN DEFAULT FALSE,
        "verification_badge" BOOLEAN DEFAULT FALSE,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🚀 Hard reset successful. Database is now at "Scratch" state.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
}

reset();
