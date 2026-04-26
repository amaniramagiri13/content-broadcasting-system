require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const approvalRoutes = require('./routes/approval.routes');
const broadcastingRoutes = require('./routes/broadcasting.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Content Broadcasting System is running.',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.use('/auth', authRoutes);
app.use('/content', broadcastingRoutes);
app.use('/content', contentRoutes);
app.use('/approval', approvalRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Content Broadcasting System running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Public API: http://localhost:${PORT}/content/live/:teacherId\n`);
});

module.exports = app;
