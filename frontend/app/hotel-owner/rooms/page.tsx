"use client";

import { useMemo, useState } from "react";
import { BedDouble, CircleDollarSign, Images, Plus, X } from "lucide-react";
import RoomCard from "@/components/hotel-owner/RoomCard";
import RoomForm, { RoomPayload } from "@/components/hotel-owner/RoomForm";
import { useHotelOwnerRooms } from "@/hooks/useHotelOwner";
import { HotelRoom } from "@/types/hotelOwner";
import { formatLkr } from "@/lib/currency";

export default function RoomsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const { rooms, loading, error, createRoom, updateRoom, deleteRoom, uploadRoomImages, deleteRoomImage } = useHotelOwnerRooms();

  const stats = useMemo(() => {
    const activeRooms = rooms.filter((room) => room.status === "active");
    const totalAvailable = rooms.reduce((sum, room) => sum + room.availableRooms, 0);
    const minPrice = rooms.length ? Math.min(...rooms.map((room) => room.pricePerNight)) : 0;
    return { active: activeRooms.length, available: totalAvailable, minPrice };
  }, [rooms]);

  const saveRoomWithImages = async (payload: RoomPayload, files: File[]) => {
    if (editingRoom) {
      const roomId = editingRoom._id || editingRoom.id || "";
      await updateRoom(roomId, payload);
      if (roomId && files.length > 0) {
        const remaining = Math.max(0, 5 - (editingRoom.images?.length || 0));
        await uploadRoomImages(roomId, files.slice(0, remaining));
      }
      setEditingRoom(null);
    } else {
      const room = await createRoom(payload);
      const roomId = room?._id || room?.id || "";
      if (roomId && files.length > 0) {
        await uploadRoomImages(roomId, files.slice(0, 5));
      }
    }
    setShowForm(false);
  };

  const startAdd = () => {
    setEditingRoom(null);
    setShowForm((s) => !s);
  };

  const startEdit = (id: string) => {
    const room = rooms.find((item) => (item._id || item.id) === id);
    if (!room) return;
    setEditingRoom(room);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">
              <BedDouble size={14} /> Room inventory studio
            </p>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-emerald-950 md:text-4xl">Rooms dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-900/70">Add and manage room types, prices, amenities, availability, and room photos from one simple panel.</p>
          </div>
          <button onClick={startAdd} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-extrabold text-emerald-950">
            {showForm && !editingRoom ? <X size={16} /> : <Plus size={16} />} {showForm && !editingRoom ? "Close builder" : "Add room"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={<BedDouble size={18} />} label="Active room types" value={String(stats.active)} />
        <Metric icon={<Images size={18} />} label="Total available rooms" value={String(stats.available)} />
        <Metric icon={<CircleDollarSign size={18} />} label="Starting price" value={stats.minPrice ? formatLkr(stats.minPrice) : "-"} />
      </section>

      {showForm ? <RoomForm initialRoom={editingRoom} onSubmitRoom={saveRoomWithImages} onCancel={closeForm} /> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-white" />)}
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {!loading && rooms.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-emerald-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-extrabold text-emerald-950">No rooms added yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-900/70">Start by creating your first room type. Add photos during creation so the public hotel page feels complete from the beginning.</p>
          <button onClick={() => setShowForm(true)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white"><Plus size={16} /> Add first room</button>
        </section>
      ) : null}

      {!loading && rooms.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => <RoomCard key={room._id || room.id} room={room} onEdit={startEdit} onDelete={deleteRoom} onUploadImages={uploadRoomImages} onDeleteImage={deleteRoomImage} />)}
        </section>
      ) : null}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">{icon}</span>
        <span className="text-2xl font-extrabold text-emerald-950">{value}</span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700/70">{label}</p>
    </article>
  );
}
