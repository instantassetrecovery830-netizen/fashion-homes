
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader, User } from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { createConciergeChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface AiConciergeProps {
  products: Product[];
  isOpen?: boolean; // Can be controlled externally if needed
}

export const AiConcierge: React.FC<AiConciergeProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref to hold the chat instance so it persists between renders
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session when products load or component mounts
  useEffect(() => {
    if (products.length > 0 && !chatSession.current) {
      chatSession.current = createConciergeChat(products);
      // Add initial greeting
      setMessages([
        {
          id: 'init',
          sender: 'ai',
          text: "Bonjour. I am your personal digital stylist. How may I assist you with your collection today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [products]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chatSession.current) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      const aiText = result.text || "I apologize, I am momentarily distracted by a runway show. Please ask again.";
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Concierge Error:", error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I seem to be having trouble connecting to the atelier. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!chatSession.current) return null; // Don't render until ready

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 animate-fade-in">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] md:w-[400px] h-[500px] bg-white shadow-2xl border border-gray-100 flex flex-col rounded-sm overflow-hidden animate-slide-up origin-bottom-right">
          {/* Header */}
          <div className="bg-luxury-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-luxury-gold" />
              <h3 className="font-serif italic text-sm tracking-widest">Concierge</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 text-sm rounded-sm ${
                    msg.sender === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] opacity-50 mt-1 block uppercase tracking-widest">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start w-full">
                 <div className="bg-white border border-gray-200 p-3 rounded-sm">
                    <Loader size={16} className="animate-spin text-luxury-gold" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for styling advice..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="text-luxury-black hover:text-luxury-gold transition-colors disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-luxury-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-luxury-gold transition-all duration-300 group relative"
      >
        {isOpen ? (
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        ) : (
          <>
            <MessageSquare size={24} />
            {/* Online Indicator */}
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
};
