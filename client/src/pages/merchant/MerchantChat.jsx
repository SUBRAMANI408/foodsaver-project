import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Users, Search, Image as ImageIcon, MapPin, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { connectSocket, getSocket, disconnectSocket } from '../../services/socket';
import { fetchMerchantDirectory } from '../../redux/slices/merchantCommunitySlice';
import useDebounce from '../../hooks/useDebounce';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MerchantChat = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetMerchantId = searchParams.get('merchantId');
  
  const { user } = useSelector(state => state.auth);
  const { merchantDirectory } = useSelector(state => state.merchantCommunity);
  
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // 'global' or { _id: merchantId, name: ... }
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const activeConvIdRef = useRef('merchant_community_global');
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredDirectory = merchantDirectory?.filter(m => 
    m.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    m.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  // Initialize Socket & Data
  useEffect(() => {
    dispatch(fetchMerchantDirectory(false));
    const socket = connectSocket();
    
    if (socket) {
      socket.emit('chat:join', 'merchant_community_global');
      socket.on('chat:message', (msg) => {
        setMessages(prev => {
          if (activeConvIdRef.current && msg.conversationId !== activeConvIdRef.current) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      });
      socket.on('user:online', (userId) => setOnlineUsers(prev => ({...prev, [userId]: true})));
      socket.on('user:offline', (userId) => setOnlineUsers(prev => ({...prev, [userId]: false})));
    }

    return () => {
      if (socket) {
        socket.off('chat:message');
        socket.off('user:online');
        socket.off('user:offline');
      }
    };
  }, [dispatch]);

  // Load Initial Target Merchant Chat if passed in URL
  useEffect(() => {
    if (targetMerchantId && merchantDirectory.length > 0) {
      const merchant = merchantDirectory.find(m => m._id === targetMerchantId);
      if (merchant) {
        setActiveChat(merchant);
        loadMessages(targetMerchantId);
      }
    } else if (!activeChat) {
      setActiveChat('global');
      loadMessages('global');
    }
  }, [targetMerchantId, merchantDirectory]);

  // Load Messages from API
  const loadMessages = async (chatId) => {
    try {
      const convId = chatId === 'global' ? 'merchant_community_global' : getPrivateConvId(user._id, chatId);
      activeConvIdRef.current = convId;
      const res = await api.get(`/chat/messages/${convId}`);
      setMessages(res.data.data || []);
      scrollToBottom();
      
      const socket = getSocket();
      if (socket) socket.emit('chat:join', convId);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const getPrivateConvId = (id1, id2) => {
    return 'merch_' + [id1, id2].sort().join('_');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const convId = activeChat === 'global' ? 'merchant_community_global' : getPrivateConvId(user._id, activeChat._id);
    const receiverId = activeChat === 'global' ? null : activeChat._id;
    const receiverModel = activeChat === 'global' ? null : 'Merchant';

    const msgPayload = {
      conversationId: convId,
      receiverId,
      receiverModel,
      content: inputMessage,
      type: 'text'
    };

    try {
      const res = await api.post('/chat/messages', msgPayload);
      setInputMessage('');
      // Message is pushed via socket to everyone in the room (including us)
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    if (chat === 'global') {
      setSearchParams({});
      loadMessages('global');
    } else {
      setSearchParams({ merchantId: chat._id });
      loadMessages(chat._id);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] -m-4 md:-m-6 lg:-m-8 bg-slate-100 flex overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Chats</h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search merchants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Global Group Item */}
          <div 
            onClick={() => selectChat('global')}
            className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-100 transition-colors ${activeChat === 'global' ? 'bg-green-50' : 'hover:bg-slate-50'}`}
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">Merchant Community</h3>
              <p className="text-sm text-slate-500 truncate">Global group chat for all merchants</p>
            </div>
          </div>

          {/* Individual Merchants */}
          <div className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">All Merchants</div>
          {filteredDirectory.map(merchant => (
            <div 
              key={merchant._id}
              onClick={() => selectChat(merchant)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${activeChat?._id === merchant._id ? 'bg-green-50' : 'hover:bg-slate-50'}`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold relative">
                {merchant.businessName.charAt(0)}
                {onlineUsers[merchant._id] && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 truncate">{merchant.businessName}</h3>
                <p className="text-sm text-slate-500 truncate">{merchant.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#e5ddd5] ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => setActiveChat(null)}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              {activeChat === 'global' ? <Users className="w-5 h-5 text-slate-600" /> : <span className="font-bold text-slate-600">{activeChat?.businessName?.charAt(0)}</span>}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{activeChat === 'global' ? 'Merchant Community Group' : activeChat?.businessName}</h2>
              {activeChat !== 'global' && <p className="text-xs text-slate-500">{onlineUsers[activeChat?._id] ? 'Online' : 'Offline'}</p>}
              {activeChat === 'global' && <p className="text-xs text-slate-500">{merchantDirectory.length} participants</p>}
            </div>
          </div>
          <div className="flex gap-2 text-slate-500">
            {activeChat !== 'global' && (
              <>
                <button className="p-2 hover:bg-slate-100 rounded-full"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-100 rounded-full"><Video className="w-5 h-5" /></button>
              </>
            )}
            <button className="p-2 hover:bg-slate-100 rounded-full"><Search className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
          {messages.map((msg, idx) => {
            const isMe = msg.sender === user._id;
            const senderInfo = merchantDirectory.find(m => m._id === msg.sender) || { businessName: 'Me' };
            return (
              <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-3 shadow-sm ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {activeChat === 'global' && !isMe && (
                    <div className="text-xs font-bold text-blue-500 mb-1">{senderInfo.businessName}</div>
                  )}
                  <p className="text-slate-800 text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <span className="text-[10px] text-slate-500 float-right mt-1 ml-4">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-slate-100 px-4 py-3 flex items-end gap-2">
          <button className="p-3 text-slate-500 hover:bg-slate-200 rounded-full transition-colors shrink-0">
            <ImageIcon className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm">
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message"
              className="w-full max-h-32 px-4 py-3 resize-none focus:outline-none"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors shrink-0 disabled:opacity-50"
          >
            <Send className="w-6 h-6 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantChat;
