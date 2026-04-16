
import React, { useState } from 'react';
import { Users as UsersIcon, Search, Filter, Menu, Edit2, Trash2, Shield, MoreVertical, X, Save, Loader } from 'lucide-react';
import { User, UserRole } from '../../types.ts';

interface UsersViewProps {
    users: User[];
    setIsSidebarOpen: (open: boolean) => void;
    handleDeleteUser: (id: string) => Promise<void>;
    handleUpdateUser: (user: User) => Promise<void>;
    handleAddUser: (user: User) => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, setIsSidebarOpen, handleDeleteUser, handleUpdateUser, handleAddUser }) => {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.BUYER, status: 'ACTIVE' });
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            await handleUpdateUser(editingUser);
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateUser = async () => {
        setIsSaving(true);
        try {
            const userToCreate = {
                ...newUser,
                id: `user_${Date.now()}`,
                createdAt: new Date().toISOString(),
                joined: new Date().toISOString()
            } as User;
            await handleAddUser(userToCreate);
            setIsAddingUser(false);
            setNewUser({ role: UserRole.BUYER, status: 'ACTIVE' });
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">User Management</h2>
                <div className="flex gap-4">
                    <div className="hidden md:flex items-center bg-white border border-gray-200 px-4 py-2 rounded-sm">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input 
                            placeholder="Search users..." 
                            className="text-sm outline-none bg-transparent w-48"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsAddingUser(true)}
                        className="bg-black text-white px-4 py-2 rounded-sm font-bold text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors hidden md:block"
                    >
                        Add User
                    </button>
                    <button className="p-2 border border-gray-200 rounded-sm hover:bg-gray-50">
                        <Filter size={20} />
                    </button>
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 border border-gray-200 rounded-sm">
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-500 font-bold">
                            <tr>
                                <th className="p-6">User</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Joined</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                                                <img src={user.profileData?.avatar || user.avatar || `https://picsum.photos/seed/${user.id}/100/100`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] uppercase font-bold flex items-center gap-1 w-fit ${
                                            user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                                            user.role === 'VENDOR' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-50 text-gray-700'
                                        }`}>
                                            {user.role === 'ADMIN' && <Shield size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-500">{new Date(user.createdAt || user.joined || Date.now()).toLocaleDateString()}</td>
                                    <td className="p-6">
                                        <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} /> 
                                            {user.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black" 
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
                                                        handleDeleteUser(user.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full text-red-400 hover:text-red-600" 
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center text-gray-400">
                                            <UsersIcon size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm font-serif italic">No users found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm max-w-md w-full p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif italic">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email || ''}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                                <select
                                    value={editingUser.role || 'BUYER'}
                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                >
                                    <option value="BUYER">Buyer</option>
                                    <option value="VENDOR">Vendor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                <select
                                    value={editingUser.status || 'ACTIVE'}
                                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-sm font-bold text-sm tracking-widest uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-black text-white hover:bg-gray-900 rounded-sm font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add User Modal */}
            {isAddingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-sm max-w-md w-full p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif italic">Add New User</h3>
                            <button onClick={() => setIsAddingUser(false)} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newUser.name || ''}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email || ''}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                    placeholder="e.g. john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                                <select
                                    value={newUser.role || 'BUYER'}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                >
                                    <option value="BUYER">Buyer</option>
                                    <option value="VENDOR">Vendor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                <select
                                    value={newUser.status || 'ACTIVE'}
                                    onChange={e => setNewUser({ ...newUser, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })}
                                    className="w-full p-3 border border-gray-200 rounded-sm outline-none focus:border-black"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsAddingUser(false)}
                                className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-sm font-bold text-sm tracking-widest uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={isSaving || !newUser.name || !newUser.email}
                                className="flex-1 py-3 bg-black text-white hover:bg-gray-900 rounded-sm font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
