import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Mail, Download, Trash2, Plus, Send, RefreshCw, 
  CheckSquare, Square, Filter, Sparkles, Bell, Clock, Shirt,
  ChevronDown, ArrowUpRight, CheckCircle2, User, AlertCircle
} from 'lucide-react';
import { WaitlistEntry, Product, LandingPageContent } from '../../types.ts';
import { 
  fetchAllWaitlistEntries, 
  deleteWaitlistEntryFromDb, 
  clearAllWaitlistEntriesInDb,
  joinWaitlistInDb
} from '../../services/dataService.ts';
import { db } from '../../services/firebase.ts';
import { collection, setDoc, doc } from 'firebase/firestore';

interface WaitlistManagementViewProps {
  products: Product[];
  cmsContent?: LandingPageContent;
  setIsSidebarOpen?: (open: boolean) => void;
}

export const WaitlistManagementView: React.FC<WaitlistManagementViewProps> = ({
  products,
  cmsContent,
  setIsSidebarOpen
}) => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Add subscriber form state
  const [newEmail, setNewEmail] = useState('');
  const [newProductId, setNewProductId] = useState('general_drop');
  const [newSize, setNewSize] = useState('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState('Exclusive Capsule Alert');
  const [broadcastMessage, setBroadcastMessage] = useState('The highly anticipated luxury drop you requested is officially live. Secure your piece now.');

  // Load entries from Firestore
  const loadWaitlist = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllWaitlistEntries();
      // Sort newest first
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(data);
    } catch (err) {
      console.error("Error loading waitlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
  }, []);

  // Map product ID to name
  const getProductName = (prodId: string) => {
    if (!prodId || prodId === 'general_drop') {
      return cmsContent?.drop?.title || 'VANTABLACK ETHER COAT (General Drop)';
    }
    const found = products.find(p => p.id === prodId);
    if (found) return found.name;
    
    // Check multi drops if available
    if (cmsContent?.drops && cmsContent.drops.length > 0) {
      const drop = cmsContent.drops.find(d => d.id === prodId);
      if (drop) return drop.title;
    }

    return prodId;
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProductName(e.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.size && e.size.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProduct = filterProduct === 'ALL' || e.productId === filterProduct;

      return matchesSearch && matchesProduct;
    });
  }, [entries, searchTerm, filterProduct, products, cmsContent]);

  // Unique Product IDs present in waitlist
  const uniqueProductsInWaitlist = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => set.add(e.productId || 'general_drop'));
    return Array.from(set);
  }, [entries]);

  // Unique email count
  const uniqueEmailsCount = useMemo(() => {
    const set = new Set(entries.map(e => e.email.toLowerCase()));
    return set.size;
  }, [entries]);

  // Handle batch selection
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map(e => e.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Delete single entry
  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm("Remove this email subscription from the waitlist?")) return;
    try {
      await deleteWaitlistEntryFromDb(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove entry.");
    }
  };

  // Delete selected batch entries
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected waitlist entries?`)) return;

    try {
      for (const id of selectedIds) {
        await deleteWaitlistEntryFromDb(id);
      }
      setEntries(prev => prev.filter(e => !selectedIds.includes(e.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected entries.");
    }
  };

  // Clear all
  const handleClearAll = async () => {
    if (entries.length === 0) return;
    if (!window.confirm("WARNING: Are you sure you want to clear the entire waitlist? This action cannot be undone.")) return;

    try {
      await clearAllWaitlistEntriesInDb();
      setEntries([]);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Failed to clear waitlist.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert("No waitlist data to export.");
      return;
    }

    const headers = ["ID", "Email", "Target Item / Drop", "Size", "Date Subscribed"];
    const rows = filteredEntries.map(e => [
      `"${e.id}"`,
      `"${e.email}"`,
      `"${getProductName(e.productId).replace(/"/g, '""')}"`,
      `"${e.size || 'ALL'}"`,
      `"${new Date(e.date).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `waitlist_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add subscriber submit
  const handleAddSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      alert("Please provide a valid email address.");
      return;
    }

    setIsAdding(true);
    try {
      const entry: WaitlistEntry = {
        id: `wait_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        email: newEmail.trim().toLowerCase(),
        productId: newProductId,
        size: newSize,
        date: new Date().toISOString()
      };

      await joinWaitlistInDb(entry);
      await loadWaitlist();
      setNewEmail('');
      setIsAddModalOpen(false);
      alert("Subscriber added to waitlist successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to add subscriber.");
    } finally {
      setIsAdding(false);
    }
  };

  // Send broadcast alert submit
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      alert("Title and message are required.");
      return;
    }

    const recipients = selectedIds.length > 0 
      ? entries.filter(e => selectedIds.includes(e.id)) 
      : filteredEntries;

    if (recipients.length === 0) {
      alert("No subscribers selected or found for broadcast.");
      return;
    }

    if (!window.confirm(`Send notification alert to ${recipients.length} subscriber(s)?`)) return;

    setIsSendingBroadcast(true);
    try {
      // Send notifications into Firestore notifications collection for each recipient
      for (const rec of recipients) {
        const notifId = `notif_wait_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await setDoc(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: rec.email.toLowerCase(),
          title: broadcastTitle,
          message: broadcastMessage,
          read: false,
          date: new Date().toISOString(),
          type: 'RESTOCK',
          link: rec.productId
        });
      }

      setBroadcastSuccess(`Successfully dispatched release alert to ${recipients.length} subscriber(s)!`);
      setTimeout(() => {
        setBroadcastSuccess('');
        setIsBroadcastModalOpen(false);
      }, 2500);

    } catch (err) {
      console.error("Error sending broadcast:", err);
      alert("Failed to dispatch alert.");
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-luxury-gold text-xs font-bold uppercase tracking-[0.2em] mb-1">
            <Sparkles size={14} /> VIP Access & Audience Control
          </div>
          <h1 className="text-3xl font-serif italic text-luxury-black">Waitlist Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor, manage, and dispatch exclusive notifications to subscribers awaiting product releases & restocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadWaitlist}
            className="p-2.5 text-gray-500 hover:text-black border border-gray-200 rounded-sm hover:border-black transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center gap-2 rounded-sm"
          >
            <Plus size={15} /> Add Subscriber
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-4 py-2.5 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors flex items-center gap-2 rounded-sm shadow-md"
          >
            <Send size={15} /> Send Release Alert
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-gray-100 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Subscriptions</p>
            <h3 className="text-2xl font-serif font-bold text-luxury-black mt-1">{entries.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-luxury-cream flex items-center justify-center text-luxury-black">
            <Mail size={18} />
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-100 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Unique Clients</p>
            <h3 className="text-2xl font-serif font-bold text-luxury-black mt-1">{uniqueEmailsCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={18} />
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-100 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Targeted Releases</p>
            <h3 className="text-2xl font-serif font-bold text-luxury-black mt-1">{uniqueProductsInWaitlist.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-luxury-gold">
            <Shirt size={18} />
          </div>
        </div>

        <div className="bg-white p-5 border border-gray-100 rounded-sm shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Selected for Action</p>
            <h3 className="text-2xl font-serif font-bold text-luxury-black mt-1">{selectedIds.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckSquare size={18} />
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white p-4 border border-gray-200 rounded-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search email, product or size..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
          />
        </div>

        {/* Filter Dropdown & Export Tools */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
              className="border border-gray-200 py-2 px-3 text-xs rounded-sm bg-white focus:outline-none focus:border-black"
            >
              <option value="ALL">All Products & Drops ({entries.length})</option>
              {uniqueProductsInWaitlist.map(pid => (
                <option key={pid} value={pid}>
                  {getProductName(pid).slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-700 rounded-sm flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-xs font-bold uppercase tracking-wider text-red-600 rounded-sm flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} /> Delete Selected ({selectedIds.length})
            </button>
          )}

          {entries.length > 0 && selectedIds.length === 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-gray-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              title="Purge Waitlist"
            >
              Purge All
            </button>
          )}
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-xs uppercase tracking-widest">
            <RefreshCw className="animate-spin inline-block mr-2" size={16} /> Loading Subscribers...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Mail size={32} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No waitlist subscribers found</p>
            <p className="text-xs text-gray-400">
              Subscribers will appear here when buyers sign up for upcoming drops or out-of-stock items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={handleSelectAll} className="text-gray-400 hover:text-black">
                      {selectedIds.length === filteredEntries.length && filteredEntries.length > 0 ? (
                        <CheckSquare size={16} className="text-black" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Subscriber Email</th>
                  <th className="p-4">Target Release / Capsule</th>
                  <th className="p-4">Requested Size</th>
                  <th className="p-4">Subscribed Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map(entry => {
                  const isSelected = selectedIds.includes(entry.id);
                  const prodName = getProductName(entry.productId);

                  return (
                    <tr 
                      key={entry.id} 
                      className={`hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-luxury-cream/40' : ''}`}
                    >
                      <td className="p-4">
                        <button onClick={() => handleToggleSelect(entry.id)} className="text-gray-400 hover:text-black">
                          {isSelected ? <CheckSquare size={16} className="text-black" /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="p-4 font-mono font-medium text-luxury-black">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-sans font-bold text-[10px]">
                            {entry.email.charAt(0).toUpperCase()}
                          </div>
                          <span>{entry.email}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {prodName}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-600">
                        {entry.size ? (
                          <span className="px-2 py-0.5 border border-gray-200 rounded text-[10px] uppercase font-bold">
                            {entry.size}
                          </span>
                        ) : (
                          <span className="text-gray-400">ALL</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-[11px]">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedIds([entry.id]);
                            setIsBroadcastModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-luxury-black hover:bg-gray-100 rounded transition-colors"
                          title="Send Direct Notification Alert"
                        >
                          <Send size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove Entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-sm shadow-xl border border-gray-200 relative">
            <h3 className="text-xl font-serif italic text-luxury-black mb-1">Add Waitlist Subscriber</h3>
            <p className="text-xs text-gray-500 mb-6">Manually register a VIP client for an upcoming capsule release or item restock.</p>

            <form onSubmit={handleAddSubscriberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Client Email</label>
                <input
                  type="email"
                  required
                  placeholder="client@luxurydomain.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Target Product / Capsule</label>
                <select
                  value={newProductId}
                  onChange={e => setNewProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="general_drop">{cmsContent?.drop?.title || 'VANTABLACK ETHER COAT (General Drop)'}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.designer})</option>
                  ))}
                  {cmsContent?.drops?.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Requested Size</label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL or ALL"
                  value={newSize}
                  onChange={e => setNewSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors disabled:opacity-50"
                >
                  {isAdding ? 'Registering...' : 'Add Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast / Alert Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-sm shadow-xl border border-gray-200 relative">
            <h3 className="text-xl font-serif italic text-luxury-black mb-1">Dispatch Release Alert</h3>
            <p className="text-xs text-gray-500 mb-4">
              Send an instant back-in-stock / capsule launch notification to {selectedIds.length > 0 ? `${selectedIds.length} selected subscriber(s)` : `all ${filteredEntries.length} filtered subscriber(s)`}.
            </p>

            {broadcastSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="font-bold text-sm">{broadcastSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Notification Title</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 text-xs rounded-sm focus:outline-none focus:border-black leading-relaxed"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-sm border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                  <Bell size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Subscribers will receive an instant in-app notification & alert badge when they next access the platform.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="px-5 py-2 bg-luxury-black text-white text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSendingBroadcast ? 'Dispatching...' : <><Send size={14} /> Send Broadcast</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistManagementView;
