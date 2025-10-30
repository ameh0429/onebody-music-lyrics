// import express from 'express';
// import dotenv from 'dotenv';
// import { sequelize } from './config/database.js';
// import artisteRoutes from './routes/artisteRoutes.js';
// import albumRoutes from './routes/albumRoutes.js';
// import songRoutes from './routes/songRoutes.js';
// import errorHandler from './middleware/errorHandler.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/artistes', artisteRoutes);
// app.use('/api/albums', albumRoutes);
// app.use('/api/songs', songRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Onebody Music Lyrics API is running' });
// });

// // Error handling middleware
// app.use(errorHandler);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Database connection and server start
// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connection established successfully.');
    
//     // Sync models with database
//     await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
//     // console.log('Database synchronized.');
    
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error('Unable to start server:', error);
//     process.exit(1);
//   }
// };

// startServer();

// export default app;

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/database.js';
import artisteRoutes from './routes/artisteRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import songRoutes from './routes/songRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/artistes', artisteRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Onebody Music Lyrics API is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;