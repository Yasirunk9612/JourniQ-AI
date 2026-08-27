import { HotelRoom } from "@/types/hotelOwner";
import { formatLkr } from "@/lib/currency";

export default function RoomCard({
  room,
  onEdit,
  onDelete,
  onUploadImages,
  onDeleteImage,
}: {
  room: HotelRoom;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUploadImages?: (id: string, files: File[]) => void;
  onDeleteImage?: (id: string, imageUrl: string) => void;
}) {
  const id = room._id || room.id;
  const photoCount = room.images?.length || 0;
  const remainingPhotos = Math.max(0, 5 - photoCount);
  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="grid grid-cols-3 gap-1 bg-emerald-50 p-2">
        {(room.images || []).slice(0, 5).map((image, index) => (
          <div key={image} className="group relative h-24 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={`${room.roomType} photo ${index + 1}`} className="h-full w-full object-cover" />
            <button type="button" onClick={() => onDeleteImage?.(id, image)} className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-100 transition hover:bg-red-700 md:opacity-0 md:group-hover:opacity-100">Remove</button>
          </div>
        ))}
        {photoCount < 5 && photoCount > 0 ? Array.from({ length: 5 - photoCount }).map((_, index) => <div key={`empty-${index}`} className="grid h-24 place-items-center rounded-xl border border-dashed border-emerald-200 bg-white text-xs font-semibold text-emerald-700">Open slot</div>) : null}
        {photoCount === 0 ? <div className="col-span-3 grid h-24 place-items-center rounded-xl bg-emerald-100 text-sm text-emerald-800">No room photos yet</div> : null}
      </div>
      <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg text-emerald-950">{room.roomType}</h3>
          <p className="text-sm text-emerald-700">{room.capacity} guests • {formatLkr(room.pricePerNight)} / night</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${room.status === "active" ? "bg-emerald-100 text-emerald-700" : room.status === "maintenance" ? "bg-amber-100 text-amber-700" : "bg-neutral-200 text-neutral-700"}`}>{room.status}</span>
      </div>
      <p className="mt-3 text-sm text-emerald-900/80">{room.description}</p>
      <p className="mt-3 text-xs text-emerald-700">Amenities: {room.amenities.join(", ")}</p>
      <p className="mt-1 text-xs text-emerald-700">Available: {room.availableRooms}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => onEdit?.(id)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">Edit</button>
        <label className={`cursor-pointer rounded-lg border border-emerald-200 px-3 py-1.5 text-sm ${remainingPhotos === 0 ? "bg-slate-100 text-slate-400" : "text-emerald-800 hover:bg-emerald-50"}`}>
          {remainingPhotos === 0 ? "5 photos added" : `Upload photos (${remainingPhotos} left)`}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
            const files = Array.from(e.target.files || []).slice(0, remainingPhotos);
            if (files.length > 0) onUploadImages?.(id, files);
            e.currentTarget.value = "";
          }} disabled={remainingPhotos === 0} />
        </label>
        <button onClick={() => onDelete?.(id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">Delete</button>
      </div>
      </div>
    </article>
  );
}
