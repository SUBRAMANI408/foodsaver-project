import jwt from 'jsonwebtoken';

export const setupSockets = (io) => {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (${socket.userRole})`);

    // Join personal room
    socket.join(`${socket.userRole}:${socket.userId}`);

    // Delivery partner location update
    socket.on('delivery:location', async (data) => {
      const { lat, lng, orderId } = data;
      try {
        const { default: DeliveryPartner } = await import('../models/DeliveryPartner.js');
        await DeliveryPartner.findByIdAndUpdate(socket.userId, {
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
        });
        // Broadcast to relevant order room
        if (orderId) {
          io.to(`order:${orderId}`).emit('delivery:location:update', { lat, lng, orderId });
        }
      } catch (error) {
        console.error('Location update error:', error);
      }
    });

    // Join order room for tracking
    socket.on('order:join', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    // Order status updates
    socket.on('order:status', (data) => {
      io.to(`order:${data.orderId}`).emit('order:status:update', data);
    });

    // Merchant availability toggle
    socket.on('merchant:availability', async (isOpen) => {
      try {
        const { default: Merchant } = await import('../models/Merchant.js');
        await Merchant.findByIdAndUpdate(socket.userId, { isOpen });
        socket.broadcast.emit('merchant:status', { merchantId: socket.userId, isOpen });
      } catch (error) {
        console.error('Merchant availability error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
    });
  });
};
