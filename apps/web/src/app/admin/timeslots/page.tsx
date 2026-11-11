"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type TimeSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
};

export default function AdminTimeSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: 10,
    isActive: true,
  });

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pickups/slots/all`, { credentials: "include" }); // admin endpoint
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format time correctly if needed, the API expects string "11:00 AM" etc.
      const res = await fetch(`${API_URL}/pickups/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Admin routes require auth
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSlots();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add time slot");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;
    try {
      const res = await fetch(`${API_URL}/pickups/slots/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchSlots();
      } else {
        alert("Failed to delete time slot");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({ 
      date: tomorrow.toISOString().split('T')[0], 
      startTime: "11:00 AM", 
      endTime: "11:30 AM",
      capacity: 10,
      isActive: true
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Time Slots Management</h1>
        <button 
          onClick={openModal}
          className="bg-brand-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-maroon-dark transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Time Slot
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading time slots...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Time Window</th>
                  <th className="p-4 font-semibold">Capacity</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No time slots found.</td>
                  </tr>
                ) : (
                  slots.map((slot) => {
                    const slotDate = new Date(slot.date);
                    const isPast = slotDate < new Date(new Date().setHours(0,0,0,0));
                    return (
                    <tr key={slot.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isPast ? "opacity-50" : ""}`}>
                      <td className="p-4 font-semibold text-gray-900">{slotDate.toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-gray-600">{slot.startTime} - {slot.endTime}</td>
                      <td className="p-4 text-sm text-gray-600">{slot.capacity} orders</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${slot.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {slot.isActive ? "Active" : "Inactive"}
                        </span>
                        {isPast && <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Past</span>}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(slot.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Time Slot</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" required 
                  value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (e.g. 10:00 AM)</label>
                  <input 
                    type="text" required placeholder="10:00 AM"
                    value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time (e.g. 11:30 AM)</label>
                  <input 
                    type="text" required placeholder="11:30 AM"
                    value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input 
                  type="number" required min="1"
                  value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" id="isActive"
                  checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-brand-maroon rounded border-gray-300 focus:ring-brand-maroon"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (Visible to customers)</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-brand-maroon text-white font-medium rounded-xl hover:bg-brand-maroon-dark transition-colors">
                  Add Slot
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
