"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { hotelOwnerApi } from "@/lib/hotelOwnerApi";
import { useHotelOwnerRooms } from "@/hooks/useHotelOwner";

export default function AvailabilityPage() {
  const { rooms, loading, error, load } = useHotelOwnerRooms();
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState(0);

  const onRoomChange = (id: string) => {
    setSelectedRoomId(id);
    const room = rooms.find((r) => (r._id || r.id) === id);
    if (room) setAvailableRooms(room.availableRooms);
  };

  const updateAvailability = async () => {
    if (!selectedRoomId || !fromDate || !toDate) {
      toast.error("Please select room and date range");
      return;
    }
    await hotelOwnerApi.updateAvailability({ roomId: selectedRoomId, fromDate, toDate, availableRooms });
    toast.success("Availability updated");
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-emerald-950">Availability Management</h1>
      <section className="rounded-2xl border border-emerald-100 bg-white p-5">
        <h3 className="text-lg text-emerald-950">Availability Controls</h3>

        {loading ? <p className="mt-3 text-emerald-800">Loading rooms...</p> : null}
        {error ? <p className="mt-3 text-red-700">{error}</p> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-5">
          <select value={selectedRoomId} onChange={(e) => onRoomChange(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2">
            <option value="">Select room</option>
            {rooms.map((room) => <option key={room._id || room.id} value={room._id || room.id}>{room.roomType}</option>)}
          </select>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-xl border border-emerald-200 px-3 py-2" />
          <input type="number" min={0} value={availableRooms} onChange={(e) => setAvailableRooms(Number(e.target.value))} className="rounded-xl border border-emerald-200 px-3 py-2" />
          <button onClick={updateAvailability} className="rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white">Update Availability</button>
        </div>
      </section>
    </div>
  );
}
