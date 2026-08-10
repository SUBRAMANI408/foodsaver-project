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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data.unreadCount;
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
      // Add message if it belongs to active conversation
      if (state.activeConversation?._id === action.payload.conversationId || 
          state.activeConversation?.id === action.payload.conversationId || 
          action.payload.conversationId === state.activeConversation?.conversationId) { // Fallbacks for ID names
          
          // Check if message already exists to prevent duplicates
          const exists = state.messages.find(m => m._id === action.payload._id);
          if (!exists) {
            state.messages.push(action.payload);
          }
      }
      
      // Update last message in conversation list
      const convIndex = state.conversations.findIndex(c => 
        c._id === action.payload.conversationId || c.conversationId === action.payload.conversationId
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = action.payload;
        if (state.activeConversation?._id !== action.payload.conversationId && 
            action.payload.sender !== state.activeConversation?.userId) {
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
    },
    clearChat: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => { state.messagesLoading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
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
