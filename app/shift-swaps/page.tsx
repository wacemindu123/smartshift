'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Calendar, Clock, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuthUser } from '@/hooks/useAuth';
import api from '@/lib/api';

interface ShiftSwap {
  id: string;
  shiftId: string;
  requesterId: string;
  targetUserId?: string;
  status: 'PENDING' | 'CLAIMED' | 'APPROVED' | 'DENIED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  denialReason?: string;
  createdAt: string;
  shift: {
    id: string;
    startTime: string;
    endTime: string;
    role: {
      id: string;
      name: string;
      category: string;
    };
  };
  requester: {
    id: string;
    name: string;
  };
  targetUser?: {
    id: string;
    name: string;
  };
  approver?: {
    id: string;
    name: string;
  };
}

export default function ShiftSwapsPage() {
  const { user, isOperator } = useAuthUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: swaps = [], isLoading } = useQuery({
    queryKey: ['shift-swaps'],
    queryFn: async () => {
      const response = await api.get('/shift-swaps');
      return response.data as ShiftSwap[];
    },
  });

  const claimMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/shift-swaps/${id}/claim`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shift-swaps'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/shift-swaps/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] });
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const denyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/shift-swaps/${id}/deny`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shift-swaps'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shift-swaps/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shift-swaps'] }),
  });

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DENIED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CLAIMED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDeny = (id: string) => {
    const reason = prompt('Reason for denial:');
    if (reason) {
      denyMutation.mutate({ id, reason });
    }
  };

  const availableSwaps = swaps.filter((s) => s.status === 'PENDING' && s.requesterId !== userId);
  const myRequests = swaps.filter((s) => s.requesterId === userId);
  const claimedByMe = swaps.filter((s) => s.targetUserId === userId);
  const pendingApproval = swaps.filter((s) => s.status === 'CLAIMED');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shift Swaps</h1>
          <p className="text-gray-600">Trade shifts with your team</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Available Swaps */}
            {!isOperator && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Available Swaps ({availableSwaps.length})
                </h2>
                {availableSwaps.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No available swaps</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableSwaps.map((swap) => (
                      <SwapCard
                        key={swap.id}
                        swap={swap}
                        action={
                          <button
                            onClick={() => claimMutation.mutate(swap.id)}
                            disabled={claimMutation.isPending}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                          >
                            Claim Shift
                          </button>
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* My Requests */}
            {!isOperator && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  My Requests ({myRequests.length})
                </h2>
                {myRequests.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">No swap requests</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myRequests.map((swap) => (
                      <SwapCard
                        key={swap.id}
                        swap={swap}
                        action={
                          swap.status === 'PENDING' && (
                            <button
                              onClick={() => cancelMutation.mutate(swap.id)}
                              disabled={cancelMutation.isPending}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Cancel
                            </button>
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Claimed by Me */}
            {!isOperator && claimedByMe.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Claimed by Me ({claimedByMe.length})
                </h2>
                <div className="grid gap-4">
                  {claimedByMe.map((swap) => (
                    <SwapCard key={swap.id} swap={swap} />
                  ))}
                </div>
              </section>
            )}

            {/* Pending Approval (Operators) */}
            {isOperator && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pending Approval ({pendingApproval.length})
                </h2>
                {pendingApproval.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">No swaps pending approval</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pendingApproval.map((swap) => (
                      <SwapCard
                        key={swap.id}
                        swap={swap}
                        action={
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveMutation.mutate(swap.id)}
                              disabled={approveMutation.isPending}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeny(swap.id)}
                              disabled={denyMutation.isPending}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Deny"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* All Swaps (Operators) */}
            {isOperator && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  All Swaps ({swaps.length})
                </h2>
                <div className="grid gap-4">
                  {swaps.map((swap) => (
                    <SwapCard key={swap.id} swap={swap} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function SwapCard({ swap, action }: { swap: ShiftSwap; action?: React.ReactNode }) {
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DENIED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CLAIMED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-gray-900">{swap.shift.role.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                swap.status
              )}`}
            >
              {swap.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDateTime(swap.shift.startTime)} - {formatDateTime(swap.shift.endTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Requested by: {swap.requester.name}</span>
            </div>

            {swap.targetUser && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Claimed by: {swap.targetUser.name}</span>
              </div>
            )}

            {swap.status === 'DENIED' && swap.denialReason && (
              <p className="text-red-600">
                <span className="font-medium">Denied:</span> {swap.denialReason}
              </p>
            )}
          </div>
        </div>

        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  );
}
