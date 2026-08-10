import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  messagesLoading: false,
  error: null,
  onlineUsers: {},
  typingUsers: {},
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, receiverId, receiverModel, content, type, metadata, requirementId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/messages', {
        conversationId,
        receiverId,
        receiverModel,
        content,
        type,
        metadata,
        requirementId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const shareAddress = createAsyncThunk(
  'chat/shareAddress',
  async ({ conversationId, receiverId, receiverModel, requirementId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat/messages/address', {
        conversationId,
        receiverId,
        receiverModel,
        requirementId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share address');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const msg = action.payload;
      const isActiveConv =
        state.activeConversation?._id === msg.conversationId ||
        state.activeConversation?.id === msg.conversationId ||
        msg.conversationId === state.activeConversation?.conversationId;

      // Add message to messages list if it belongs to active conversation
      if (isActiveConv) {
        const exists = state.messages.find(m => m._id === msg._id);
        if (!exists) {
          state.messages.push(msg);
        }
      } else {
        // Increment global unread count for messages in non-active conversations
        state.unreadCount = (state.unreadCount || 0) + 1;
      }

      // Update last message in conversation list
      const convIndex = state.conversations.findIndex(c =>
        c._id === msg.conversationId || c.conversationId === msg.conversationId
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = msg;
        if (!isActiveConv) {
          state.conversations[convIndex].unreadCount = (state.conversations[convIndex].unreadCount || 0) + 1;
        }
      }
    },
    setOnlineUser: (state, action) => {
      state.onlineUsers[action.payload] = true;
    },
    removeOnlineUser: (state, action) => {
      delete state.onlineUsers[action.payload];
    },
    setTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][userId] = true;
    },
    clearTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId][userId];
      }
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // Clear unread count for this conversation when opened
      if (action.payload) {
        const convId = action.payload._id || action.payload.conversationId || action.payload.id;
        const convIndex = state.conversations.findIndex(c =>
          c._id === convId || c.conversationId === convId
        );
        if (convIndex !== -1) {
          const prevUnread = state.conversations[convIndex].unreadCount || 0;
          state.conversations[convIndex].unreadCount = 0;
          state.unreadCount = Math.max(0, (state.unreadCount || 0) - prevUnread);
        }
      }
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      
      // sendMessage
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        const convIndex = state.conversations.findIndex(c => 
          c._id === action.payload.conversationId || c.conversationId === action.payload.conversationId
        );
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = action.payload;
        }
      })
      
      // shareAddress
      .addCase(shareAddress.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        const convIndex = state.conversations.findIndex(c => 
          c._id === action.payload.conversationId || c.conversationId === action.payload.conversationId
        );
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = action.payload;
        }
      })
      
      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const { 
  addMessage, 
  setOnlineUser, 
  removeOnlineUser, 
  setTyping, 
  clearTyping, 
  setActiveConversation,
  clearChat 
} = chatSlice.actions;

export default chatSlice.reducer;
