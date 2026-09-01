import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  User,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  Circle
} from 'lucide-react';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { socket, connected } = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showMobilePane, setShowMobilePane] = useState('list'); // 'list' or 'chat'

  const messagesEndRef = useRef(null);

  // Auto-scroll messages list to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all conversations for the user
  const fetchConversations = async (selectConv = null) => {
    try {
      setLoadingConversations(true);
      const response = await api.get('/chat/conversations');
      setConversations(response.data);

      // Handle selecting a conversation initially
      if (selectConv) {
        // Check if selectConv is already in the list
        const exists = response.data.find((c) => c._id === selectConv._id);
        if (exists) {
          setActiveConversation(exists);
          setShowMobilePane('chat');
        } else {
          // Prepend new conversation to lists
          setConversations((prev) => [selectConv, ...prev]);
          setActiveConversation(selectConv);
          setShowMobilePane('chat');
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Check if redirecting from ProductDetails (initiating new conversation)
    const passedConv = location.state?.startConversation;
    const timer = setTimeout(() => {
      fetchConversations(passedConv);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.state]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation || !activeConversation._id) return;
    // Don't call API if synthetic client-only ID
    if (typeof activeConversation._id === 'string' && activeConversation._id.startsWith('conv_')) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await api.get(`/chat/messages/${activeConversation._id}`);
        setMessages(response.data);

        // Mark local conversation as read in conversations sidebar
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: c.lastMessage ? { ...c.lastMessage, isRead: true } : null }
              : c
          )
        );
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConversation]);

  // Socket.io Listener: Receive incoming messages in real-time
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      console.log('Real-time message received:', newMessage);

      // Case 1: Message belongs to the active conversation
      if (activeConversation && newMessage.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, newMessage]);

        // Acknowledge read status by calling API
        api.get(`/chat/messages/${activeConversation._id}`).catch((err) =>
          console.error('Error auto-marking read:', err)
        );
      } else {
        // Case 2: Message belongs to another conversation. Increase unread indicator.
        // If the conversation is already in list, update its last message and mark unread
        setConversations((prev) => {
          const index = prev.findIndex((c) => c._id === newMessage.conversationId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: {
                ...newMessage,
                isRead: false
              },
              updatedAt: new Date().toISOString()
            };
            // Re-sort conversation list by latest message
            return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          } else {
            // New conversation dynamically created. Fetch list from backend.
            fetchConversations();
            return prev;
          }
        });
      }

      // Update conversations list with latest message preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMessage.conversationId
            ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeConversation]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const recipient = activeConversation.participants.find(
      (p) => p._id !== user._id
    );

    if (!recipient) return;

    try {
      const response = await api.post('/chat/messages', {
        conversationId: activeConversation._id,
        recipientId: recipient._id,
        text: messageText,
      });

      // Add sent message locally
      setMessages((prev) => [...prev, response.data]);
      setMessageText('');

      // Update conversations list sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: response.data, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      alert(msg);
    }
  };

  const getChatPartner = (conv) => {
    return conv.participants.find((p) => p._id !== user._id) || { name: 'Seller', role: 'customer' };
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 flex">
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex">
        
        {/* Main Chat Layout Container */}
        <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden flex h-[78vh]">
          
          {/* LEFT PANEL: CONVERSATIONS LIST */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col ${
              showMobilePane === 'chat' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <MessageSquare size={18} className="text-rose-500" />
                  Your Conversations
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chat with buyers and sellers
                </p>
              </div>
              
              {/* Online connection indicator */}
              <div className="flex items-center gap-1">
                <Circle
                  size={10}
                  className={`fill-current ${connected ? 'text-green-500' : 'text-slate-300'}`}
                />
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {connected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loadingConversations ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => {
                  const partner = getChatPartner(conv);
                  const isUnread =
                    conv.lastMessage &&
                    conv.lastMessage.sender !== user._id &&
                    !conv.lastMessage.isRead;
                  const isActive = activeConversation?._id === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => {
                        setActiveConversation(conv);
                        setShowMobilePane('chat');
                      }}
                      className={`p-4 flex items-start space-x-3 cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'bg-rose-50/50 border-l-4 border-rose-500'
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {partner.name}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 capitalize bg-slate-100 px-1.5 py-0.5 rounded">
                            {partner.role === 'seller' ? 'Entrepreneur' : 'Buyer'}
                          </span>
                        </div>
                        
                        {/* Conversation Subtitle (Product Reference if available) */}
                        {conv.productId && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 mt-0.5">
                            <ShoppingBag size={10} />
                            <span className="truncate">{conv.productId.title}</span>
                          </div>
                        )}

                        <p
                          className={`text-xs mt-1 truncate ${
                            isUnread ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'
                          }`}
                        >
                          {conv.lastMessage?.text || 'Start chatting...'}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <div className="w-2.5 h-2.5 bg-rose-600 rounded-full shrink-0 self-center animate-pulse" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageSquare size={36} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-medium text-slate-400">
                    No active chats yet.
                  </p>
                  <p className="text-xs text-slate-300 mt-1 max-w-[200px] mx-auto">
                    Visit the marketplace and select a product to inquire.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: MESSAGE INTERFACE */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/20 ${
              showMobilePane === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm shadow-slate-100/10">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Back navigation on mobile */}
                    <button
                      onClick={() => setShowMobilePane('list')}
                      className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 shrink-0"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                      <User size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate leading-tight">
                        {getChatPartner(activeConversation).name}
                      </h3>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full fill-current ${connected ? 'bg-green-500' : 'bg-slate-300'}`} />
                        Connected
                      </span>
                    </div>
                  </div>

                  {/* Reference Product Details */}
                  {activeConversation.productId && (
                    <Link
                      to={`/product/${activeConversation.productId._id}`}
                      className="flex items-center gap-2 p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shrink-0 ml-4 max-w-[150px] sm:max-w-xs"
                    >
                      {activeConversation.productId.imageUrl && (
                        <img
                          src={activeConversation.productId.imageUrl}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover bg-slate-50 shrink-0"
                        />
                      )}
                      <div className="hidden sm:block min-w-0 text-left">
                        <p className="text-[10px] font-bold text-slate-700 truncate leading-none">
                          {activeConversation.productId.title}
                        </p>
                        <p className="text-[10px] font-extrabold text-rose-600 mt-1 leading-none">
                          ₹{Number(activeConversation.productId.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.sender._id === user._id || msg.sender === user._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-rose-600 text-white rounded-br-none'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 font-medium ${
                                isMe ? 'text-rose-100' : 'text-slate-400'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <Sparkles size={28} className="mx-auto text-rose-300 animate-bounce mb-3" />
                      <p className="text-sm font-bold text-slate-800">
                        Start a conversation!
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Type a message below to send an inquiry to the owner.
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Footer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2 shadow-inner"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message, coordinate delivery or negotiate price..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              // Empty placeholder state
              <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-white/50">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-100 mb-4 animate-pulse">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Select a Conversation
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-sm">
                  Click on an inquiry in your sidebar or initiate a chat from the marketplace product page to contact a creator.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Chat;
