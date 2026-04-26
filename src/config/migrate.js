require('dotenv').config();
const { query } = require('./database');

const migrate = async () => {
  try {
    console.log('Running migrations...');

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('principal', 'teacher')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✓ Users table created');

    await query(`
      CREATE TABLE IF NOT EXISTS content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        rotation_duration INTEGER DEFAULT 5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✓ Content table created');

    await query(`
      CREATE TABLE IF NOT EXISTS content_slots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(teacher_id, subject)
      )
    `);
    console.log('✓ Content slots table created');

    await query(`
      CREATE TABLE IF NOT EXISTS content_schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        slot_id UUID NOT NULL REFERENCES content_slots(id) ON DELETE CASCADE,
        rotation_order INTEGER NOT NULL,
        duration INTEGER NOT NULL DEFAULT 5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(slot_id, rotation_order)
      )
    `);
    console.log('✓ Content schedule table created');

    await query(`CREATE INDEX IF NOT EXISTS idx_content_uploaded_by ON content(uploaded_by)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_content_status ON content(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_content_subject ON content(subject)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_content_slots_teacher ON content_slots(teacher_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_schedule_slot ON content_schedule(slot_id)`);
    console.log('✓ Indexes created');

    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
