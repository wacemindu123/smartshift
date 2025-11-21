'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuthUser } from '@/hooks/useAuth';
import { useApi } from '@/lib/api';
import { toast } from 'react-toastify';

interface TimeOffRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  reviewedBy?: string;
  reviewedAt?: string;
  denialReason?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
  };
}

export default function TimeOffPage() {
  const { isOperator } = useAuthUser();
  const api = useApi();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['time-off'],
    queryFn: async () => {
      const response = await api.get('/time-off');
      return response.data as TimeOffRequest[];
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDayCount = (start: string, end: string) => {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DENIED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/time-off/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-off'] }),
  });

  const denyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/time-off/${id}/deny`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-off'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/time-off/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['time-off'] }),
  });

  const handleDeny = (id: string) => {
    const reason = prompt('Reason for denial:');
    if (reason) {
      denyMutation.mutate({ id, reason });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Off Requests</h1>
            <p className="text-gray-600">Manage vacation and time off</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Request Time Off
          </button>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No time off requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.user.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{getDayCount(request.startDate, request.endDate)} days</span>
                      </div>
                    </div>

                    {request.reason && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    )}

                    {request.status === 'DENIED' && request.denialReason && (
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Denied:</span> {request.denialReason}
                      </p>
                    )}

                    {request.reviewer && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed by {request.reviewer.name} on{' '}
                        {formatDate(request.reviewedAt!)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isOperator && request.status === 'PENDING' && (
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
                          onClick={() => handleDeny(request.id)}
                          disabled={denyMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deny"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {!isOperator && request.status === 'PENDING' && (
                      <button
                        onClick={() => deleteMutation.mutate(request.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTimeOffModal api={api} onClose={() => setShowCreateModal(false)} />
      )}
    </Layout>
  );
}

function CreateTimeOffModal({ api, onClose }: { api: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/time-off', { startDate, endDate, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] });
      toast.success('Time-off request submitted successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to submit time-off request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date must be after start date');
      return;
    }
    
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Request Time Off</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Vacation, personal day, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
