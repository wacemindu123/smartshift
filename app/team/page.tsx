'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddRoleModal from '@/components/AddRoleModal';
import EditUserModal from '@/components/EditUserModal';
import { User, WorkRole } from '@/shared/types';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TeamPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });

  // Fetch work roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery<WorkRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data;
    },
  });

  const isLoading = usersLoading || rolesLoading;

  const employees = users.filter(u => u.role === 'EMPLOYEE');
  const operators = users.filter(u => u.role === 'OPERATOR');

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove user');
    },
  });

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to remove ${user.name}? This will delete all their shifts and data.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage your team members and roles</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Team Member</span>
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Managers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2 text-primary-600" />
                Managers ({operators.length})
              </h2>
              {operators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {operators.map((user) => (
                    <UserCard key={user.id} user={user} roles={roles} onEdit={setEditingUser} onDelete={handleDeleteUser} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No managers yet</p>
              )}
            </div>

            {/* Employees */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2 text-primary-600" />
                Employees ({employees.length})
              </h2>
              {employees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((user) => (
                    <UserCard key={user.id} user={user} roles={roles} onEdit={setEditingUser} onDelete={handleDeleteUser} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No employees yet. Add team members to get started.
                </p>
              )}
            </div>

            {/* Work Roles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Work Roles</h2>
                <button
                  onClick={() => setShowAddRoleModal(true)}
                  className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Role</span>
                </button>
              </div>
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {role.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No work roles defined. Add roles like Server, Cook, Host, etc.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Add Team Member</h3>
            <p className="text-gray-600 mb-4">
              To add team members, they need to:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Sign up at your app URL</li>
              <li>Create an account with Clerk</li>
              <li>They'll automatically appear here</li>
            </ol>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with your team: <br />
              <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <AddRoleModal onClose={() => setShowAddRoleModal(false)} />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
        />
      )}
    </Layout>
  );
}

function UserCard({ user, roles, onEdit, onDelete }: { user: User; roles: WorkRole[]; onEdit: (user: User) => void; onDelete: (user: User) => void }) {
  const userRole = roles.find(r => r.id === user.workRoleId);
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {userRole && (
          <div className="flex items-center text-sm">
            <span className="text-gray-600">Role:</span>
            <span className="ml-2 px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
              {userRole.name}
            </span>
          </div>
        )}
        <div className="flex items-center text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onEdit(user)}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4 inline mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete(user)}
          className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
          title="Remove user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
