import api from './api';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateEventPayload {
  title: string;
  start_time: string;
  end_time: string;
}

export interface UpdateEventPayload {
  title?: string;
  start_time?: string;
  end_time?: string;
}

const eventService = {
  getEvents: async (status?: string): Promise<{ events: Event[] }> => {
    const params = status ? { status } : {};
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEvent: async (eventId: string): Promise<{ event: Event }> => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  createEvent: async (payload: CreateEventPayload): Promise<{ event: Event }> => {
    const response = await api.post('/events', payload);
    return response.data;
  },

  updateEvent: async (eventId: string, payload: UpdateEventPayload): Promise<{ event: Event }> => {
    const response = await api.put(`/events/${eventId}`, payload);
    return response.data;
  },

  deleteEvent: async (eventId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  updateEventStatus: async (eventId: string, status: string): Promise<{ event: Event }> => {
    const response = await api.patch(`/events/${eventId}/status`, { status });
    return response.data;
  },
};

export default eventService;
