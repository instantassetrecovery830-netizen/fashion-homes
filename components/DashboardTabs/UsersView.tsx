
import React from 'react';
import { Users as UsersIcon, Search, Filter, Menu, Edit2, Trash2, Shield, MoreVertical } from 'lucide-react';
import { User } from '../../types.ts';

interface UsersViewProps {
    users: User[];
    setIsSidebarOpen: (open: boolean) => void;
    handleDeleteUser: (id: string) => Promise<void>;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, setIsSidebarOpen, handleDeleteUser }) => {
    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif italic">User Management</h2>
                <div className="flex gap-4">
                    <div className="hidden md:flex items-center bg-white border border-gray-200 px-4 py-2 rounded-sm">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input placeholder="Search users..." className="text-sm outline-none bg-transparent w-48" />
                    </div>
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
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                                                <img src={user.profileData?.avatar || `https://picsum.photos/seed/${user.id}/100/100`} className="w-full h-full object-cover" alt="" />
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
                                    <td className="p-6 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-6">
                                        <span className="text-green-600 text-[10px] uppercase font-bold flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black" title="Edit User">
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
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
                            {users.length === 0 && (
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
        </div>
    );
};
