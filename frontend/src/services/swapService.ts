import api from './api';

export interface SwapRequest {
  id: string;
  requester_id: string;
  requestee_id: string;
  requester_slot_id: string;
  requestee_slot_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    name: string;
  };
  requestee?: {
    id: string;
    name: string;
  };
  requester_slot?: any;
  requestee_slot?: any;
}

const swapService = {
  getSwappableSlots: async (limit?: number, offset?: number) => {
    const params = { limit: limit || 50, offset: offset || 0 };
    const response = await api.get('/swappable-slots', { params });
    return response.data;
  },

  createSwapRequest: async (mySlotId: string, theirSlotId: string) => {
    const response = await api.post('/swap-request', {
      mySlotId,
      theirSlotId,
    });
    return response.data;
  },

  respondToSwapRequest: async (requestId: string, accept: boolean) => {
    const response = await api.post(`/swap-response/${requestId}`, {
      accept,
    });
    return response.data;
  },

  getIncomingRequests: async (status?: string, limit?: number, offset?: number) => {
    const params: any = { limit: limit || 50, offset: offset || 0 };
    if (status) params.status = status;
    const response = await api.get('/swap-requests/incoming', { params });
    return response.data;
  },

  getOutgoingRequests: async (status?: string, limit?: number, offset?: number) => {
    const params: any = { limit: limit || 50, offset: offset || 0 };
    if (status) params.status = status;
    const response = await api.get('/swap-requests/outgoing', { params });
    return response.data;
  },
};

export default swapService;
