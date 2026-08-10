import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Clock, Calendar, Utensils, Check, CheckCheck, ArrowLeft, Search, Circle, MessageCircle, X, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

import { connectSocket, getSocket, disconnectSocket } from '../services/socket';
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage as sendMessageThunk, 
  shareAddress, 
  fetchUnreadCount, 
  addMessage, 
  setOnlineUser, 
  removeOnlineUser, 
  setTyping, 
  clearTyping, 
  setActiveConversation, 
  clearChat 
} from '../redux/slices/chatSlice';

export default function ChatPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  const [searchParams] = useSearchParams();
  const convQueryId = searchParams.get('conv');
  const actualConvId = urlConversationId || convQueryId;
  
  const currentUser = useSelector((s) => s.auth.user);
  const currentUserId = currentUser?._id;
  
  const { 
    conversations, 
    activeConversation, 
    messages, 
    loading, 
    messagesLoading,
    onlineUsers,
    typingUsers 
  } = useSelector((s) => s.chat);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Socket connection and event listeners
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;
    
    // Join all conversation rooms when conversations load
    if (Array.isArray(conversations) && conversations.length > 0) {
      conversations.forEach(conv => {
        socket.emit('chat:join', conv.conversationId || conv._id);
      });
    }

    const handleMessage = (msg) => dispatch(addMessage(msg));
    const handleOnline = (userId) => dispatch(setOnlineUser(userId));
    const handleOffline = (userId) => dispatch(removeOnlineUser(userId));
    const handleTyping = (data) => {
      dispatch(setTyping(data));
      // Auto-clear typing after 3 seconds if stop-typing isn't received
      setTimeout(() => dispatch(clearTyping(data)), 3000);
    };
    const handleStopTyping = (data) => dispatch(clearTyping(data));
    
    socket.on('chat:message', handleMessage);
    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop-typing', handleStopTyping);
    
    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop-typing', handleStopTyping);
      disconnectSocket();
    };
  }, [dispatch, conversations]);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchUnreadCount());
    
    return () => {
      dispatch(clearChat());
    };
  }, [dispatch]);

  // Handle URL param for active conversation
  useEffect(() => {
    if (actualConvId && actualConvId !== 'undefined' && Array.isArray(conversations)) {
      if (loading) return;
      
      const conv = conversations.find(c => c.conversationId === actualConvId || c._id === actualConvId);
      if (conv) {
        handleSelectConversation(conv);
      } else {
        // If not found in list but we have URL, we might need to fetch it specifically or create a stub active conversation
        dispatch(setActiveConversation({ conversationId: actualConvId }));
        dispatch(fetchMessages(actualConvId));
        setMobileView('chat');
      }
    }
  }, [actualConvId, conversations, loading]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSelectConversation = (conv) => {
    const id = conv.conversationId || conv._id;
    dispatch(setActiveConversation(conv));
    dispatch(fetchMessages(id));
    setMobileView('chat');
    
    // Update URL if needed (shallow routing)
    const basePath = currentUser?.role === 'merchant' ? '/merchant/chat' : '/helping-center/chat';
    window.history.replaceState(null, '', `${basePath}/${id}`);
  };

  const getOtherParty = (conversation) => {
    if (!conversation) return null;
    if (conversation.otherParty) return conversation.otherParty; // If API provides it directly
    
    // Deduce from last message if available
    const lastMsg = conversation.lastMessage;
    if (lastMsg) {
       return lastMsg.sender === currentUserId ? lastMsg.receiver : lastMsg.sender;
    }
    
    // Deduce from conversation ID format req_reqId_ngoId_merchantId
    const id = conversation.conversationId || conversation._id || '';
    const parts = id.split('_');
    if (parts.length >= 4) {
      const ngoId = parts[2];
      const merchantId = parts[3];
      return currentUser?.role === 'merchant' ? ngoId : merchantId;
    }
    return null;
  };

  const getOtherPartyDetails = () => {
    const otherParty = getOtherParty(activeConversation);
    const isPopulatedObject = typeof otherParty === 'object' && otherParty !== null;
    const otherPartyId = isPopulatedObject ? (otherParty._id || otherParty.id) : otherParty;
    
    const participant = activeConversation?.participants?.find(p => p._id === otherPartyId || p.userId === otherPartyId);
    
    return {
      id: otherPartyId,
      name: participant?.name || participant?.businessName || (isPopulatedObject ? (otherParty.centerName || otherParty.businessName || otherParty.name) : null) || 'User',
      avatar: participant?.avatar || (isPopulatedObject ? otherParty.logo : null),
      isOnline: otherPartyId ? (onlineUsers[otherPartyId] || false) : false,
      model: currentUser?.role === 'merchant' ? 'HelpingCenter' : 'Merchant'
    };
  };

  const handleTypingChange = (e) => {
    setMessageInput(e.target.value);
    
    const socket = getSocket();
    if (!socket || !activeConversation) return;
    
    const convId = activeConversation.conversationId || activeConversation._id;
    
    // Emit typing
    socket.emit('chat:typing', { conversationId: convId, userId: currentUserId });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:stop-typing', { conversationId: convId, userId: currentUserId });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;
    
    const otherParty = getOtherPartyDetails();
    const convId = activeConversation.conversationId || activeConversation._id;
    const reqId = convId.split('_')[1]; // Extract requirementId from convId if standard format
    
    try {
      await dispatch(sendMessageThunk({
        conversationId: convId,
        receiverId: otherParty.id,
        receiverModel: otherParty.model,
        content: messageInput.trim(),
        type: 'text',
        requirementId: reqId
      })).unwrap();
      
      setMessageInput('');
      
      const socket = getSocket();
      if (socket) {
        socket.emit('chat:stop-typing', { conversationId: convId, userId: currentUserId });
      }
    } catch (err) {
      toast.error(err || 'Failed to send message');
    }
  };

  const handleShareAddress = async () => {
    if (!activeConversation) return;
    
    const otherParty = getOtherPartyDetails();
    const convId = activeConversation.conversationId || activeConversation._id;
    const reqId = convId.split('_')[1];
    
    try {
      await dispatch(shareAddress({
        conversationId: convId,
        receiverId: otherParty.id,
        receiverModel: otherParty.model,
        requirementId: reqId
      })).unwrap();
      
      setShowAddressConfirm(false);
      toast.success('Address shared successfully');
    } catch (err) {
      toast.error(err || 'Failed to share address');
    }
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(c => {
    // If we have names to search against, implement here. For now, simple return true
    return true; 
  }) : [];

  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words">{msg.content}</p>;
      
      case 'system':
        return (
          <div className="flex justify-center my-4">
            <span className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-dark-800/50 px-3 py-1 rounded-full">
              {msg.content}
            </span>
          </div>
        );
        
      case 'address_share':
        return (
          <div className="bg-white dark:bg-dark-800 border border-emerald-200 dark:border-emerald-800/50 rounded-xl overflow-hidden min-w-[240px] max-w-sm mt-1 mb-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 border-b border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Shared Address</span>
            </div>
            <div className="p-4 border-l-4 border-emerald-500">
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                {msg.metadata?.name || msg.content}
              </p>
              {msg.metadata?.address && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {msg.metadata.address}
                </p>
              )}
              {msg.metadata?.phone && (
                <div className="text-sm text-slate-500 dark:text-slate-500 flex items-center gap-1">
                  <span>Phone:</span> {msg.metadata.phone}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'delivery_schedule':
        return (
          <div className="bg-white dark:bg-dark-800 border border-blue-200 dark:border-blue-800/50 rounded-xl overflow-hidden min-w-[240px] max-w-sm mt-1 mb-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-800/30 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Delivery Scheduled</span>
            </div>
            <div className="p-4 border-l-4 border-blue-500">
              <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                {msg.content}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{msg.metadata?.date || 'Today'}, {msg.metadata?.time || ''}</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return <p>{msg.content}</p>;
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const activeOtherPartyDetails = getOtherPartyDetails();
  const convId = activeConversation?.conversationId || activeConversation?._id;
  const isTyping = convId && typingUsers[convId]?.[activeOtherPartyDetails.id];

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] -m-4 md:-m-6 lg:-m-8 bg-slate-50 dark:bg-dark-900 flex overflow-hidden">
      
      {/* LEFT PANEL: Conversation List */}
      <div className={`w-full md:w-[320px] lg:w-[360px] bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-700 flex flex-col flex-shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-dark-800 bg-white dark:bg-dark-900 z-10">
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-dark-800 border-transparent focus:bg-white dark:focus:bg-dark-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl text-sm transition-all"
            />
          </div>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const otherPartyId = getOtherParty(conv);
              // Basic mock names if participants array isn't populated properly
              const name = `User ${otherPartyId?.substring(0, 4) || ''}`; 
              const isOnline = onlineUsers[otherPartyId];
              const lastMsg = conv.lastMessage;
              const isUnread = conv.unreadCount > 0;
              const isActive = (activeConversation?.conversationId === conv.conversationId || activeConversation?._id === conv._id);
              
              return (
                <div 
                  key={conv.conversationId || conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-slate-50 dark:border-dark-800/50 transition-colors ${
                    isActive 
                      ? 'bg-primary-50/50 dark:bg-primary-900/10' 
                      : 'hover:bg-slate-50 dark:hover:bg-dark-800'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg overflow-hidden flex-shrink-0">
                      {name.charAt(0)}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-900 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className={`text-sm truncate ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                        {name}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap ml-2">
                          {formatMessageTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate max-w-[180px] ${isUnread ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {lastMsg ? (lastMsg.type === 'text' ? lastMsg.content : `[${lastMsg.type.replace('_', ' ')}]`) : 'No messages yet'}
                      </p>
                      {isUnread && (
                        <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-dark-900 relative ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-dark-700 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden flex-shrink-0">
                  {activeOtherPartyDetails.avatar ? <img src={activeOtherPartyDetails.avatar} alt="avatar" /> : activeOtherPartyDetails.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {activeOtherPartyDetails.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Circle className={`w-2 h-2 fill-current ${activeOtherPartyDetails.isOnline ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className={activeOtherPartyDetails.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'}>
                      {activeOtherPartyDetails.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors hidden sm:block">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-primary-500" />
                  </div>
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.type === 'system') {
                    return <div key={msg._id || idx}>{renderMessageContent(msg)}</div>;
                  }
                  
                  const isMine = msg.sender === currentUserId;
                  const showAvatar = !isMine && (idx === 0 || messages[idx-1].sender !== msg.sender || messages[idx-1].type === 'system');
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg._id || idx} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`flex max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                        
                        {/* Avatar spacer or avatar */}
                        {!isMine && (
                          <div className="w-8 flex-shrink-0 flex items-end pb-1">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {activeOtherPartyDetails.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className="flex flex-col">
                          {renderMessageContent(msg)}
                          
                          {/* Message metadata (time & status) */}
                          <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMine && (
                              msg.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                        
                      </div>
                    </motion.div>
                  );
                })
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[70%]">
                    <div className="w-8 flex-shrink-0 flex items-end pb-1">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-dark-700 flex items-center justify-center text-xs font-bold">
                        {activeOtherPartyDetails.name.charAt(0)}
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-dark-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-700">
              
              {/* Address Confirmation Overlay */}
              <AnimatePresence>
                {showAddressConfirm && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-[80px] left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-dark-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-dark-700 z-20"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" /> Share Address
                      </h4>
                      <button onClick={() => setShowAddressConfirm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Are you sure you want to share your registered address and contact details with {activeOtherPartyDetails.name}?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddressConfirm(false)} className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-700 font-medium hover:bg-slate-50 dark:hover:bg-dark-700">
                        Cancel
                      </button>
                      <button onClick={handleShareAddress} className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">
                        Share Details
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
                <button 
                  type="button"
                  onClick={() => setShowAddressConfirm(!showAddressConfirm)}
                  title="Share Address"
                  className="p-3 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors shrink-0"
                >
                  <MapPin className="w-5 h-5" />
                </button>
                
                <div className="flex-1 bg-slate-100 dark:bg-dark-800 rounded-2xl flex items-center px-4 py-1 border border-transparent focus-within:border-primary-500/30 focus-within:bg-white dark:focus-within:bg-dark-900 transition-colors">
                  <textarea 
                    value={messageInput}
                    onChange={handleTypingChange}
                    placeholder="Type a message..."
                    className="w-full max-h-32 py-2.5 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 scrollbar-hide"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{ minHeight: '44px' }}
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 dark:disabled:bg-dark-700 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-dark-900">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-dark-800 dark:to-dark-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <MessageCircle className="w-10 h-10 text-primary-500/50" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mb-2">SaveBite Messages</h2>
            <p className="text-slate-500 max-w-md">
              Select a conversation from the list to start chatting. Connect with {currentUser?.role === 'merchant' ? 'Helping Centers' : 'Merchants'} to coordinate food rescue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
