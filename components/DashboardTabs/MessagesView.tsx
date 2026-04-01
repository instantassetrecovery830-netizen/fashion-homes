import React from 'react';
import { Inbox, Menu, CheckCircle, Archive, MessageSquare } from 'lucide-react';
import { ContactSubmission } from '../../types.ts';

interface MessagesViewProps {
  contactSubmissions: ContactSubmission[];
  onUpdateContact: (id: string, status: 'NEW' | 'READ' | 'ARCHIVED') => Promise<void>;
  setIsSidebarOpen: (open: boolean) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  contactSubmissions,
  onUpdateContact,
  setIsSidebarOpen,
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif italic">Messages & Inquiries</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
          <Menu size={20} />
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400">
            <Inbox size={14} /> Contact Submissions
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {contactSubmissions.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            contactSubmissions.map((msg) => (
              <div key={msg.id} className={`p-6 hover:bg-gray-50/50 transition-colors ${msg.status === 'NEW' ? 'border-l-4 border-luxury-gold' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm">{msg.name}</h4>
                    <p className="text-xs text-gray-400">{msg.email} • {new Date(msg.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {msg.status !== 'READ' && (
                      <button 
                        onClick={() => onUpdateContact(msg.id, 'READ')}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as Read"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {msg.status !== 'ARCHIVED' && (
                      <button 
                        onClick={() => onUpdateContact(msg.id, 'ARCHIVED')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                <div className="mt-4">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:text-black transition-colors">
                    Reply to Inquiry
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
