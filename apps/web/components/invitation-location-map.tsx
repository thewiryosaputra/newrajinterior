"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({
  onChange,
}: {
  onChange: (position: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function Recenter({ position }: { position: { lat: number; lng: number } }) {
  const map = useMapEvents({});

  useEffect(() => {
    map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15), {
      animate: true,
    });
  }, [map, position.lat, position.lng]);

  return null;
}

export default function InvitationLocationMap({
  position,
  onChange,
}: {
  position: { lat: number; lng: number };
  onChange: (position: { lat: number; lng: number }) => void;
}) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full min-h-[280px] w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      <Recenter position={position} />
      <Marker
        draggable
        eventHandlers={{
          dragend(event) {
            const marker = event.target as L.Marker;
            const next = marker.getLatLng();
            onChange({ lat: next.lat, lng: next.lng });
          },
        }}
        icon={markerIcon}
        position={[position.lat, position.lng]}
      />
    </MapContainer>
  );
}