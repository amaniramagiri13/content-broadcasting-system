const { query } = require('../config/database');

const getAllContent = async ({ status, subject, teacher_id, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let conditions = [];
  let params = [];
  let paramCount = 1;

  if (status) { conditions.push(`c.status = $${paramCount}`); params.push(status); paramCount++; }
  if (subject) { conditions.push(`c.subject = $${paramCount}`); params.push(subject.toLowerCase()); paramCount++; }
  if (teacher_id) { conditions.push(`c.uploaded_by = $${paramCount}`); params.push(teacher_id); paramCount++; }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*) FROM content c ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const result = await query(
    `SELECT c.*, u.name AS uploaded_by_name, p.name AS approved_by_name
     FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     LEFT JOIN users p ON c.approved_by = p.id
     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    params
  );

  return {
    data: result.rows,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
  };
};

const getPendingContent = async ({ page = 1, limit = 10 }) => {
  return getAllContent({ status: 'pending', page, limit });
};

const reviewContent = async (contentId, principalId, { action, rejection_reason }) => {
  const contentResult = await query('SELECT * FROM content WHERE id = $1', [contentId]);
  if (contentResult.rows.length === 0) {
    throw { status: 404, message: 'Content not found.' };
  }

  const content = contentResult.rows[0];
  if (content.status !== 'pending') {
    throw { status: 400, message: `Content is already ${content.status}. Only pending content can be reviewed.` };
  }

  let updateQuery, updateParams;

  if (action === 'approve') {
    updateQuery = `
      UPDATE content 
      SET status = 'approved', approved_by = $1, approved_at = NOW(), rejection_reason = NULL
      WHERE id = $2 RETURNING *`;
    updateParams = [principalId, contentId];
  } else {
    updateQuery = `
      UPDATE content 
      SET status = 'rejected', rejection_reason = $1, approved_by = NULL, approved_at = NULL
      WHERE id = $2 RETURNING *`;
    updateParams = [rejection_reason.trim(), contentId];
  }

  const result = await query(updateQuery, updateParams);
  return result.rows[0];
};

module.exports = { getAllContent, getPendingContent, reviewContent };
