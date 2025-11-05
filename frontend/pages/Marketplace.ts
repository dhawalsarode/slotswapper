import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import swapService, { SwappableSlot } from '../services/swapService';
import eventService, { Event } from '../services/eventService';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<SwappableSlot[]>([]);
  const [userSlots, setUserSlots] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUserSlot, setSelectedUserSlot] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [slotsResponse, eventsResponse] = await Promise.all([
        swapService.getSwappableSlots(),
        eventService.getEvents('SWAPPABLE'),
      ]);
      setSlots(slotsResponse.slots);
      setUserSlots(eventsResponse.events);
    } catch (error: any) {
      toast.error('Failed to load marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSwap = async () => {
    if (!selectedSlot || !selectedUserSlot) {
      toast.error('Please select both slots');
      return;
    }

    try {
      await swapService.createSwapRequest(selectedUserSlot, selectedSlot.id);
      toast.success('Swap request created!');
      setShowSwapModal(false);
      setSelectedSlot(null);
      setSelectedUserSlot('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create swap request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slot Marketplace</h1>
          <p className="text-gray-600 mt-1">Browse and request swaps with other users</p>
        </div>

        {/* Swap Modal */}
        {showSwapModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Request Swap</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Their slot:</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold">{selectedSlot.title}</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedSlot.start_time)}</p>
                  <p className="text-sm text-gray-600">By: {selectedSlot.owner.name}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select your slot to offer:
                </label>
                <select
                  value={selectedUserSlot}
                  onChange={(e) => setSelectedUserSlot(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Choose a slot...</option>
                  {userSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.title} - {formatDate(slot.start_time)}
                    </option>
                  ))}
                </select>
              </div>

              {userSlots.length === 0 && (
                <p className="text-sm text-red-600 mb-4">
                  You don't have any swappable slots yet.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleRequestSwap}
                  disabled={!selectedUserSlot}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Swap
                </button>
                <button
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedSlot(null);
                    setSelectedUserSlot('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slots Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No swappable slots available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{slot.title}</h3>
                  <p className="text-sm text-gray-600">by {slot.owner.name}</p>
                </div>

                <div className="mb-4 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Start:</span> {formatDate(slot.start_time)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">End:</span> {formatDate(slot.end_time)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedSlot(slot);
                    setShowSwapModal(true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Request Swap
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
