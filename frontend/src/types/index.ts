export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  requestee_id: string;
  requester_slot_id: string;
  requestee_slot_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  requester?: User;
  requestee?: User;
  requester_slot?: Event;
  requestee_slot?: Event;
}
