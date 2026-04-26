const { query } = require('../config/database');

const getLiveContent = async (teacherId, subject = null) => {
  const teacherResult = await query(
    "SELECT id, name FROM users WHERE id = $1 AND role = 'teacher'",
    [teacherId]
  );

  if (teacherResult.rows.length === 0) {
    return { teacher: null, content: null, message: 'Teacher not found.' };
  }

  const teacher = teacherResult.rows[0];
  const now = new Date();

  let conditions = [
    "c.uploaded_by = $1",
    "c.status = 'approved'",
    "c.start_time IS NOT NULL",
    "c.end_time IS NOT NULL",
    "c.start_time <= $2",
    "c.end_time > $2",
  ];
  let params = [teacherId, now];
  let paramCount = 3;

  if (subject) {
    conditions.push(`c.subject = $${paramCount}`);
    params.push(subject.toLowerCase());
    paramCount++;
  }

  const result = await query(
    `SELECT c.id, c.title, c.description, c.subject, c.file_url, c.file_type,
       c.start_time, c.end_time, c.rotation_duration,
       cs.rotation_order, cs.duration, cs.slot_id
     FROM content c
     JOIN content_slots sl ON sl.teacher_id = c.uploaded_by AND sl.subject = c.subject
     JOIN content_schedule cs ON cs.content_id = c.id AND cs.slot_id = sl.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY c.subject, cs.rotation_order ASC`,
    params
  );

  if (result.rows.length === 0) {
    return { teacher, content: null, message: 'No content available.' };
  }

  const subjectMap = {};
  for (const row of result.rows) {
    if (!subjectMap[row.subject]) subjectMap[row.subject] = [];
    subjectMap[row.subject].push(row);
  }

  if (subject) {
    const subjectKey = subject.toLowerCase();
    if (!subjectMap[subjectKey]) {
      return { teacher, content: null, message: 'No content available.' };
    }
    const active = determineActiveContent(subjectMap[subjectKey], now);
    if (!active) return { teacher, content: null, message: 'No content available.' };
    return { teacher, content: formatContent(active), message: 'Content found.' };
  }

  const activeBySubject = {};
  for (const [subj, items] of Object.entries(subjectMap)) {
    const active = determineActiveContent(items, now);
    if (active) activeBySubject[subj] = formatContent(active);
  }

  if (Object.keys(activeBySubject).length === 0) {
    return { teacher, content: null, message: 'No content available.' };
  }

  return { teacher, content: activeBySubject, message: 'Content found.' };
};

const determineActiveContent = (items, now) => {
  if (!items || items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.rotation_order - b.rotation_order);

  const epoch = sorted.reduce((earliest, item) => {
    const t = new Date(item.start_time);
    return t < earliest ? t : earliest;
  }, new Date(sorted[0].start_time));

  const cycleDurationSeconds = sorted.reduce((sum, item) => sum + (item.duration * 60), 0);
  if (cycleDurationSeconds === 0) return sorted[0];

  const elapsedSeconds = Math.floor((now.getTime() - epoch.getTime()) / 1000);
  const positionInCycle = ((elapsedSeconds % cycleDurationSeconds) + cycleDurationSeconds) % cycleDurationSeconds;

  let accumulated = 0;
  for (const item of sorted) {
    accumulated += item.duration * 60;
    if (positionInCycle < accumulated) return item;
  }

  return sorted[sorted.length - 1];
};

const formatContent = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  subject: item.subject,
  file_url: item.file_url,
  file_type: item.file_type,
  start_time: item.start_time,
  end_time: item.end_time,
  rotation_duration_minutes: item.duration,
  rotation_order: item.rotation_order,
});

module.exports = { getLiveContent, determineActiveContent };
