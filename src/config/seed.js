require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./database');

const seed = async () => {
  try {
    console.log('Seeding database...');

    const principalHash = await bcrypt.hash('principal123', 12);
    const teacher1Hash = await bcrypt.hash('teacher123', 12);
    const teacher2Hash = await bcrypt.hash('teacher456', 12);

    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Principal Admin', 'principal@school.com', $1, 'principal')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
      RETURNING id
    `, [principalHash]);

    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Teacher One', 'teacher1@school.com', $1, 'teacher')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
      RETURNING id
    `, [teacher1Hash]);

    await query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Teacher Two', 'teacher2@school.com', $1, 'teacher')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
      RETURNING id
    `, [teacher2Hash]);

    console.log('✓ Users seeded');
    console.log('\nDemo Credentials:');
    console.log('─────────────────────────────────');
    console.log('Principal: principal@school.com / principal123');
    console.log('Teacher 1: teacher1@school.com / teacher123');
    console.log('Teacher 2: teacher2@school.com / teacher456');
    console.log('─────────────────────────────────');

    console.log('\n✅ Seed completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
