import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext.tsx';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  User,
  Shield,
  Key,
  Check,
  AlertCircle,
} from 'lucide-react';
import { UserRole, StaffUser } from '../types/crm.ts';

export const UsersManagementView: React.FC = () => {
  const {
    currentUser,
    staffUsers,
    createStaffUser,
    updateStaffUserRole,
    deleteStaffUser,
    setCurrentUser,
    showToast,
    setActiveTab,
  } = useCrm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');

  const isSuperAdmin = currentUser.role === 'super_admin';

  if (!isSuperAdmin) {
    const superAdminUser = staffUsers.find((u) => u.role === 'super_admin') || staffUsers[0];
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Super Admin Required</h2>
          <p className="text-xs text-slate-500 mt-1">
            User creation and system role management are restricted to Super Administrators.
          </p>
        </div>
        <div className="pt-2 flex justify-center space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setCurrentUser(superAdminUser);
              showToast(`Switched to Super Admin (${superAdminUser.name})`, 'info');
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
          >
            Switch to Super Admin
          </button>
        </div>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    createStaffUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
    });

    setNewName('');
    setNewEmail('');
    setNewRole('staff');
    setShowAddModal(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">Super Admin</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 border border-teal-200">Admin</span>;
      case 'staff':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">Staff</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">User Management</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage team accounts & access roles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Role Permissions Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-1.5 font-bold text-purple-900">
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>Super Admin</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Full access: Users, API keys, Integrations & system settings.
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-1.5 font-bold text-teal-900">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Admin</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clinic management: Treatments, Hours, KB & appointments.
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
            <User className="w-3.5 h-3.5 text-slate-600" />
            <span>Staff</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Patient operations: Live Inbox triage, Leads & Follow-ups.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Change Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staffUsers.map((user) => {
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-teal-50 text-teal-800 font-bold rounded">
                                (You)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>

                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateStaffUserRole(user.id, e.target.value as UserRole)}
                        disabled={isCurrent}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white disabled:opacity-50"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => deleteStaffUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-800">Add New User</h3>
              <p className="text-xs text-slate-400 mt-0.5">Assign credentials and portal access</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ahmed Al-Qasimi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. ahmed@democlinic.ae"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="staff">Staff (Inbox, Leads, Appointments)</option>
                  <option value="admin">Admin (Clinic Operations & Settings)</option>
                  <option value="super_admin">Super Admin (Full System & Users)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
