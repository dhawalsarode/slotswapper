import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import swapService, { SwapRequest } from '../services/swapService';
import { toast } from 'react-toastify';

export const Requests: React.FC = () => {
  const [incoming, setIncoming] = useState<SwapRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SwapRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const [incomingResponse, outgoingResponse] = await Promise.all([
        swapService.getIncomingRequests(),
        swapService.getOutgoingRequests(),
      ]);
      setIncoming(incomingResponse.requests);
      setOutgoing(outgoingResponse.requests);
    } catch (error: any) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await swapService.respondToSwapRequest(requestId, true);
      toast.success('Swap accepted!');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to accept swap');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await swapService.respondToSwapRequest(requestId, false);
      toast.success('Swap rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to reject swap');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
          <p className="text-gray-600 mt-1">Manage incoming and outgoing swap requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'incoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Incoming ({incoming.length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'outgoing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Outgoing ({outgoing.length})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'incoming' ? (
          <>
            {incoming.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No incoming swap requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {incoming.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Swap request from {request.requester?.name}
                        </h3>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">They're offering:</p>
                        <p className="font-semibold">{request.requester_slot?.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.requester_slot?.start_time)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">You're offering:</p>
                        <p className="font-semibold">{request.requestee_slot?.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.requestee_slot?.start_time)}
                        </p>
                      </div>
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {outgoing.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No outgoing swap requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {outgoing.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Swap request to {request.requestee?.name}
                        </h3>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">You're offering:</p>
                        <p className="font-semibold">{request.requester_slot?.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.requester_slot?.start_time)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">They're offering:</p>
                        <p className="font-semibold">{request.requestee_slot?.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(request.requestee_slot?.start_time)}
                        </p>
                      </div>
                    </div>

                    {request.status === 'PENDING' && (
                      <p className="text-sm text-gray-600 italic">Waiting for response...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
