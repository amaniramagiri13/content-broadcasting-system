const path = require('path');
const fs = require('fs');
const { query, getClient } = require('../config/database');

const uploadContent = async ({ title, description, subject, file, teacherId, start_time, end_time, rotation_duration }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const fileUrl = `/uploads/${file.filename}`;
    const filePath = file.path;
    const fileType = path.extname(file.filename).slice(1).toLowerCase();
    const fileSize = file.size;
    const duration = rotation_duration ? parseInt(rotation_duration) : 5;

    const contentResult = await client.query(
      `INSERT INTO content 
        (title, description, subject, file_url, file_path, file_type, file_size, uploaded_by, status, start_time, end_time, rotation_duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11)
       RETURNING *`,
      [title.trim(), description ? description.trim() : null, subject.trim().toLowerCase(),
       fileUrl, filePath, fileType, fileSize, teacherId, start_time || null, end_time || null, duration]
    );

    const content = contentResult.rows[0];

    await client.query(
      `INSERT INTO content_slots (teacher_id, subject)
       VALUES ($1, $2) ON CONFLICT (teacher_id, subject) DO NOTHING`,
      [teacherId, subject.trim().toLowerCase()]
    );

    const slotResult = await client.query(
      'SELECT id FROM content_slots WHERE teacher_id = $1 AND subject = $2',
      [teacherId, subject.trim().toLowerCase()]
    );
    const slot = slotResult.rows[0];

    const maxOrderResult = await client.query(
      'SELECT COALESCE(MAX(rotation_order), 0) AS max_order FROM content_schedule WHERE slot_id = $1',
      [slot.id]
    );
    const nextOrder = maxOrderResult.rows[0].max_order + 1;

    await client.query(
      'INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration) VALUES ($1, $2, $3, $4)',
      [content.id, slot.id, nextOrder, duration]
    );

    await client.query('COMMIT');
    return content;
  } catch (err) {
    await client.query('ROLLBACK');
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw err;
  } finally {
    client.release();
  }
};

const getTeacherContent = async (teacherId, { status, subject, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let conditions = ['c.uploaded_by = $1'];
  let params = [teacherId];
  let paramCount = 2;

  if (status) { conditions.push(`c.status = $${paramCount}`); params.push(status); paramCount++; }
  if (subject) { conditions.push(`c.subject = $${paramCount}`); params.push(subject.toLowerCase()); paramCount++; }

  const whereClause = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM content c WHERE ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await query(
    `SELECT c.*, u.name AS uploaded_by_name, p.name AS approved_by_name
     FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     LEFT JOIN users p ON c.approved_by = p.id
     WHERE ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    params
  );

  return {
    data: result.rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
  };
};

const getContentById = async (contentId) => {
  const result = await query(
    `SELECT c.*, u.name AS uploaded_by_name, p.name AS approved_by_name
     FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     LEFT JOIN users p ON c.approved_by = p.id
     WHERE c.id = $1`,
    [contentId]
  );
  return result.rows[0] || null;
};

module.exports = { uploadContent, getTeacherContent, getContentById };
