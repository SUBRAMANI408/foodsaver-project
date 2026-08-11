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
    socket.join(`user_${socket.userId}`);
    
    if (socket.userRole === 'merchant') {
      socket.join('chat:merchant_community_global');
    }

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId: socket.userId });

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

    // Chat events
    socket.on('chat:join', (conversationId) => socket.join(`chat:${conversationId}`));
    socket.on('chat:leave', (conversationId) => socket.leave(`chat:${conversationId}`));
    socket.on('chat:typing', ({ conversationId, userId }) => 
      socket.to(`chat:${conversationId}`).emit('chat:typing', { userId, conversationId })
    );
    socket.on('chat:stop-typing', ({ conversationId, userId }) => 
      socket.to(`chat:${conversationId}`).emit('chat:stop-typing', { userId, conversationId })
    );

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });
};
