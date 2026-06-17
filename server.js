require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}

console.log('📡 Connecting to MongoDB...');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
});

// ================= GRACEFUL SHUTDOWN =================

process.on('SIGINT', async () => {
  console.log('\n🛑 Server shutting down...');

  try {
    server.close();
    await mongoose.connection.close();

    console.log('📦 MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    console.error('❌ Shutdown error:', err.message);
    process.exit(1);
  }
});