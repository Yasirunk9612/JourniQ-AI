"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin, Minus, Plus } from "lucide-react";

interface MapPickerProps {
  latitude: string | number;
  longitude: string | number;
  onChange: (coords: { latitude: string; longitude: string }) => void;
  title?: string;
}

type LeafletMap = {
  setView: (coords: [number, number], zoom?: number) => LeafletMap;
  on: (event: string, handler: (event: { latlng: { lat: number; lng: number } }) => void) => void;
  remove: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type LeafletMarker = {
  setLatLng: (coords: [number, number]) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
  on: (event: string, handler: (event: { target: { getLatLng: () => { lat: number; lng: number } } }) => void) => void;
};

type LeafletApi = {
  map: (id: string, options: { zoomControl: boolean; scrollWheelZoom: boolean }) => LeafletMap;
  tileLayer: (url: string, options: { attribution: string; maxZoom: number }) => { addTo: (map: LeafletMap) => void };
  marker: (coords: [number, number], options: { draggable: boolean }) => LeafletMarker;
};

declare global {
  interface Window {
    L?: LeafletApi;
    __journiqLeafletPromise?: Promise<LeafletApi>;
  }
}

const sriLankaCenter: [number, number] = [7.8731, 80.7718];

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (window.__journiqLeafletPromise) return window.__journiqLeafletPromise;

  window.__journiqLeafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-journiq-leaflet="true"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.journiqLeaflet = "true";
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector('script[data-journiq-leaflet="true"]') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => window.L ? resolve(window.L) : reject(new Error("Map library did not load.")));
      existingScript.addEventListener("error", () => reject(new Error("Map library failed to load.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.journiqLeaflet = "true";
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Map library did not load."));
    script.onerror = () => reject(new Error("Map library failed to load."));
    document.body.appendChild(script);
  });

  return window.__journiqLeafletPromise;
};

const parseCoordinate = (value: string | number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : null;
};

export default function MapPicker({ latitude, longitude, onChange, title = "Select location" }: MapPickerProps) {
  const mapId = useId().replace(/:/g, "");
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const selectedLat = parseCoordinate(latitude);
  const selectedLng = parseCoordinate(longitude);
  const hasPin = selectedLat !== null && selectedLng !== null;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const emitChange = useCallback((lat: number, lng: number) => {
    onChangeRef.current({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
  }, []);

  useEffect(() => {
    let disposed = false;

    loadLeaflet()
      .then((leaflet) => {
        if (disposed || mapRef.current) return;
        const start: [number, number] = hasPin ? [selectedLat, selectedLng] : sriLankaCenter;
        const map = leaflet.map(mapId, { zoomControl: false, scrollWheelZoom: true }).setView(start, hasPin ? 14 : 8);
        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const setPin = (lat: number, lng: number, shouldEmit = true) => {
          const coords: [number, number] = [lat, lng];
          if (!markerRef.current) {
            const marker = leaflet.marker(coords, { draggable: true }).addTo(map);
            marker.on("dragend", (event) => {
              const position = event.target.getLatLng();
              emitChange(position.lat, position.lng);
            });
            markerRef.current = marker;
          } else {
            markerRef.current.setLatLng(coords);
          }
          if (shouldEmit) emitChange(lat, lng);
        };

        if (hasPin) setPin(selectedLat, selectedLng, false);
        map.on("click", (event) => setPin(event.latlng.lat, event.latlng.lng));

        mapRef.current = map;
        setReady(true);
      })
      .catch((error) => {
        if (!disposed) setLoadError(error instanceof Error ? error.message : "Map could not load.");
      });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [emitChange, mapId]);

  useEffect(() => {
    if (!markerRef.current || !hasPin) return;
    markerRef.current.setLatLng([selectedLat, selectedLng]);
  }, [hasPin, selectedLat, selectedLng]);

  const recenter = () => {
    mapRef.current?.setView(hasPin ? [selectedLat, selectedLng] : sriLankaCenter, hasPin ? 15 : 8);
  };

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[rgba(12,59,53,0.12)] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--color-midnight)]"><MapPin size={16} /> {title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{hasPin ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : "Move, zoom, then click to place the pin."}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => mapRef.current?.zoomOut()} className="grid size-9 place-items-center rounded-full border border-emerald-100 text-emerald-900 hover:bg-emerald-50" aria-label="Zoom out"><Minus size={16} /></button>
          <button type="button" onClick={() => mapRef.current?.zoomIn()} className="grid size-9 place-items-center rounded-full border border-emerald-100 text-emerald-900 hover:bg-emerald-50" aria-label="Zoom in"><Plus size={16} /></button>
          <button type="button" onClick={recenter} className="grid size-9 place-items-center rounded-full border border-emerald-100 text-emerald-900 hover:bg-emerald-50" aria-label="Center map"><Crosshair size={16} /></button>
        </div>
      </div>
      <div className="relative">
        <div id={mapId} className="h-80 w-full bg-emerald-50" />
        {!ready && !loadError ? (
          <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm font-semibold text-emerald-900">
            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading interactive map...</span>
          </div>
        ) : null}
        {loadError ? (
          <div className="absolute inset-0 grid place-items-center bg-amber-50 px-4 text-center text-sm font-semibold text-amber-900">
            {loadError} Check your connection and try again.
          </div>
        ) : null}
      </div>
      <div className="px-4 py-3 text-xs font-semibold text-slate-500">
        Drag the map, zoom in, click to place the pin, or drag the pin to fine-tune.
      </div>
    </div>
  );
}
