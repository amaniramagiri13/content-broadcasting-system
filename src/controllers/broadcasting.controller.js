const schedulingService = require('../services/scheduling.service');

const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;

    const result = await schedulingService.getLiveContent(teacherId, subject || null);

    if (!result.teacher) {
      return res.status(200).json({
        success: true,
        message: 'No content available.',
        data: null,
      });
    }

    if (!result.content) {
      return res.status(200).json({
        success: true,
        message: result.message || 'No content available.',
        data: null,
        teacher: { id: result.teacher.id, name: result.teacher.name },
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.content,
      teacher: { id: result.teacher.id, name: result.teacher.name },
    });
  } catch (err) {
    console.error('Live content error:', err);
    return res.status(200).json({
      success: true,
      message: 'No content available.',
      data: null,
    });
  }
};

module.exports = { getLiveContent };
