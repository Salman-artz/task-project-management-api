const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');

// Route modules
const authRoutes = require('./auth');
const workspaceRoutes = require('./workspaces');
const projectRoutes = require('./projects');
const taskRoutes = require('./tasks');

// ===== Swagger API Documentation =====
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task & Project Management API Documentation',
  customfavIcon: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png',
}));

// ===== Routes =====
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

// ===== Health check endpoint =====
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
