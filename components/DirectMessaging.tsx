import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon } from 'lucide-react';
import { DirectMessage, User, Vendor } from '../types.ts';
import { fetchDirectMessages, sendDirectMessage, markDirectMessagesRead } from '../services/dataService.ts';

interface DirectMessagingProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | Vendor;
  allUsers: User[];
  vendors: Vendor[];
  initialRecipientId?: string | null;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  vendors,
  initialRecipientId
}) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialRecipientId || null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecipientId) {
      setSelectedContactId(initialRecipientId);
    }
  }, [initialRecipientId]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (selectedContactId && isOpen) {
      markDirectMessagesRead(currentUser.id, selectedContactId);
    }
    scrollToBottom();
  }, [messages, selectedContactId, isOpen]);

  const loadMessages = async () => {
    try {
      const msgs = await fetchDirectMessages(currentUser.id);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContactId) return;

    const newMessage: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser.id,
      receiverId: selectedContactId,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    await sendDirectMessage(newMessage);
    await loadMessages();
  };

  // Get unique contacts from messages
  const contactIds = Array.from(new Set(
    messages.map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  ));
  
  if (selectedContactId && !contactIds.includes(selectedContactId)) {
    contactIds.unshift(selectedContactId);
  }

  const getContactDetails = (id: string) => {
    const user = allUsers.find(u => u.id === id);
    if (user) return { name: user.name, avatar: user.avatar };
    const vendor = vendors.find(v => v.id === id);
    if (vendor) return { name: vendor.name, avatar: vendor.avatar };
    return { name: 'Unknown User', avatar: undefined };
  };

  const currentChatMessages = messages.filter(
    m => (m.senderId === currentUser.id && m.receiverId === selectedContactId) ||
         (m.senderId === selectedContactId && m.receiverId === currentUser.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium font-sans tracking-tight text-gray-900">Messages</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Contacts Sidebar (if no contact selected or on larger screens) */}
          <div className={`w-1/3 border-r border-gray-100 overflow-y-auto ${selectedContactId ? 'hidden sm:block' : 'block w-full'}`}>
            {contactIds.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 mt-10">
                No messages yet
              </div>
            ) : (
              (contactIds as string[]).map(id => {
                const contact = getContactDetails(id);
                const unreadCount = messages.filter(m => m.senderId === id && m.receiverId === currentUser.id && !m.read).length;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedContactId(id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-50 flex items-center space-x-3 transition-colors ${selectedContactId === id ? 'bg-gray-50' : ''}`}
                  >
                    <div className="relative">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon size={20} className="text-gray-500" />
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col bg-gray-50/50 ${!selectedContactId ? 'hidden sm:flex' : 'flex'}`}>
            {selectedContactId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-100 flex items-center space-x-3">
                  {/* Mobile back button */}
                  <button 
                    onClick={() => setSelectedContactId(null)}
                    className="sm:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={16} />
                  </button>
                  <div className="font-medium text-sm text-gray-900">
                    {getContactDetails(selectedContactId).name}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChatMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            isMe 
                              ? 'bg-black text-white rounded-br-sm' 
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-gray-300' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-black focus:ring-0 rounded-full px-4 py-2 text-sm transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2 bg-black text-white rounded-full disabled:opacity-50 transition-opacity"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
