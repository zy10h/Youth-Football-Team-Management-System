require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./src/routes');
const notFoundMiddleware = require('./src/middleware/notFoundMiddleware');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Lightweight liveness probe for Docker and load balancers.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'youth-football-api' });
});

// Readiness probe: only ready if MongoDB is connected.
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready' });
});

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Youth Football Team Management API is running.' });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

for (const key of ['MONGODB_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });