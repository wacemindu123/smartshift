'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { useAuthUser } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, XCircle, Clock, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';

interface AvailabilityChangeRequest {
  id: string;
  userId: string;
  requestedChanges: any;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  denialReason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reviewer: {
    id: string;
    name: string;
  } | null;
}

export default function AvailabilityRequestsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isOperator } = useAuthUser();
  const [denyingId, setDenyingId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');

  // Fetch availability change requests
  const { data: requests = [], isLoading } = useQuery<AvailabilityChangeRequest[]>({
    queryKey: ['availability-changes'],
    queryFn: async () => {
      const response = await api.get('/availability-changes');
      return response.data;
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/availability-changes/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-changes'] });
      toast.success('Availability change approved!');
    },
    onError: () => {
      toast.error('Failed to approve request');
    },
  });

  // Deny mutation
  const denyMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.patch(`/availability-changes/${id}/deny`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-changes'] });
      setDenyingId(null);
      setDenialReason('');
      toast.success('Availability change denied');
    },
    onError: () => {
      toast.error('Failed to deny request');
    },
  });

  const handleDeny = (id: string) => {
    if (!denialReason.trim()) {
      toast.error('Please provide a reason for denial');
      return;
    }
    denyMutation.mutate({ id, reason: denialReason });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatAvailability = (availability: any) => {
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days
      .filter((day) => availability[day]?.available)
      .map((day) => {
        const slot = availability[day];
        return `${day.charAt(0) + day.slice(1).toLowerCase()}: ${slot.startTime} - ${slot.endTime}`;
      })
      .join(', ');
  };

  if (!isOperator) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const processedRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Change Requests</h1>
          <p className="text-gray-600 mt-1">Review and approve employee availability changes</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Requests ({pendingRequests.length})
          </h2>

          {isLoading ? (
            <LoadingSpinner />
          ) : pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{request.user.name}</span>
                        <span className="text-sm text-gray-500">({request.user.email})</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <p className="font-medium text-gray-700 mb-1">New Availability:</p>
                        <p className="text-gray-600">{formatAvailability(request.requestedChanges)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {denyingId === request.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={denialReason}
                            onChange={(e) => setDenialReason(e.target.value)}
                            placeholder="Reason for denial..."
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeny(request.id)}
                              disabled={denyMutation.isPending}
                              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => {
                                setDenyingId(null);
                                setDenialReason('');
                              }}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDenyingId(request.id)}
                            disabled={denyMutation.isPending}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deny"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{request.user.name}</span>
                      <span className="text-gray-500 mx-2">•</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          request.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <span className="text-gray-500">{formatDate(request.reviewedAt!)}</span>
                  </div>
                  {request.status === 'DENIED' && request.denialReason && (
                    <p className="text-gray-600 mt-1">Reason: {request.denialReason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
