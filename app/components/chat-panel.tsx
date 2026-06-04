import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircle, Send, X, Minimize2, Maximize2, Paperclip, Image as ImageIcon, Smile, Download, Check, CheckCheck } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessage {
  id: string;
  sender: 'staff' | 'supplier';
  senderName: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  read?: boolean;
}

interface TypingStatus {
  userRole: 'staff' | 'supplier';
  timestamp: number;
}

interface ChatPanelProps {
  userRole: 'staff' | 'supplier';
  userName: string;
}

export default function ChatPanel({ userRole, userName }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '✅', '👌', '🙏', '💚', '🌿', '☕', '📊', '✨', '🔥'];

  // Load messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        
        // Mark messages as read when chat is open
        if (isOpen) {
          const updatedMessages = parsed.map((msg: ChatMessage) => {
            if (msg.sender !== userRole && !msg.read) {
              return { ...msg, read: true };
            }
            return msg;
          });
          
          if (JSON.stringify(updatedMessages) !== JSON.stringify(parsed)) {
            localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
            setMessages(updatedMessages);
          } else {
            setMessages(parsed);
          }
        } else {
          setMessages(parsed);
        }
        
        // Count unread messages
        if (!isOpen) {
          const unread = parsed.filter((msg: ChatMessage) => 
            msg.sender !== userRole && !msg.read
          ).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(0);
        }
      }

      // Check typing status
      const typingStatus = localStorage.getItem('typingStatus');
      if (typingStatus) {
        const status: TypingStatus = JSON.parse(typingStatus);
        const isRecent = Date.now() - status.timestamp < 3000;
        setIsTyping(isRecent && status.userRole !== userRole);
      }

      // Check online status
      const onlineStatus = localStorage.getItem('onlineStatus');
      if (onlineStatus) {
        const statuses = JSON.parse(onlineStatus);
        const otherRole = userRole === 'staff' ? 'supplier' : 'staff';
        const lastSeen = statuses[otherRole];
        setOtherUserOnline(lastSeen && Date.now() - lastSeen < 10000);
      }
    };

    loadMessages();
    
    // Poll for new messages every 1 second
    const interval = setInterval(loadMessages, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, userRole]);

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const onlineStatus = localStorage.getItem('onlineStatus') || '{}';
      const statuses = JSON.parse(onlineStatus);
      statuses[userRole] = Date.now();
      localStorage.setItem('onlineStatus', JSON.stringify(statuses));
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 5000);
    
    return () => clearInterval(interval);
  }, [userRole]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleTyping = () => {
    const typingStatus: TypingStatus = {
      userRole,
      timestamp: Date.now(),
    };
    localStorage.setItem('typingStatus', JSON.stringify(typingStatus));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      localStorage.removeItem('typingStatus');
    }, 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: userRole,
      senderName: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    localStorage.removeItem('typingStatus');
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: userRole,
        senderName: userName,
        message: type === 'image' ? 'Sent an image' : 'Sent a file',
        timestamp: new Date().toISOString(),
        type,
        fileUrl: event.target?.result as string,
        fileName: file.name,
        read: false,
      };

      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
      >
        <MessageCircle className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <Card className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'} shadow-2xl border-green-200 z-50 transition-all duration-300`}>
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              Chat | චැට්
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${otherUserOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
              <p className="text-xs text-green-100">
                {otherUserOnline ? (userRole === 'staff' ? 'Supplier Online' : 'Staff Online') : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-96 p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">පණිවිඩ නැත</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender === userRole;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                            : 'bg-white border border-green-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs font-semibold ${isOwnMessage ? 'text-green-100' : 'text-green-700'}`}>
                            {msg.senderName}
                          </p>
                          <span className={`text-xs ${isOwnMessage ? 'text-green-200' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Text Message */}
                        {msg.type === 'text' && (
                          <p className="text-sm break-words">{msg.message}</p>
                        )}
                        
                        {/* Image Message */}
                        {msg.type === 'image' && msg.fileUrl && (
                          <div className="mt-2">
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName} 
                              className="max-w-full rounded-lg max-h-48 object-cover"
                            />
                            <p className="text-xs mt-1 opacity-75">{msg.fileName}</p>
                          </div>
                        )}
                        
                        {/* File Message */}
                        {msg.type === 'file' && msg.fileUrl && (
                          <a 
                            href={msg.fileUrl} 
                            download={msg.fileName}
                            className={`flex items-center gap-2 mt-1 p-2 rounded ${isOwnMessage ? 'bg-white/20' : 'bg-green-50'}`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-xs">{msg.fileName}</span>
                            <Download className="w-3 h-3 ml-auto" />
                          </a>
                        )}

                        {/* Read Receipt */}
                        {isOwnMessage && (
                          <div className="flex justify-end mt-1">
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-green-200" />
                            ) : (
                              <Check className="w-3 h-3 text-green-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-green-200 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="px-4 py-2 bg-white border-t border-green-100">
              <div className="flex flex-wrap gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-green-100">
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Attachment Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-1 border-green-200 hover:bg-green-50"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  Emoji
                </Button>
              </div>

              {/* Message Input */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message... | පණිවිඩයක් ටයිප් කරන්න..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="flex-1 border-green-200 focus:border-green-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'image')}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'file')}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}