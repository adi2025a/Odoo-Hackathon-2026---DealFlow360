import mongoose from 'mongoose';

export const getHealthStatus = (req, res) => {
  const dbStatusState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    message: 'MERN Express Backend Server is running smoothly!',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbStatusState] || 'Unknown',
      readyState: dbStatusState,
    },
    environment: process.env.NODE_ENV || 'development',
  });
};
