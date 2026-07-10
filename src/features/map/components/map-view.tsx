"use client";

import * as React from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import { useTheme } from "next-themes";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMapStore } from "@/features/map/store";
import { PlacePin, EventPin, GuidePin } from "@/features/map/components/marker-pins";
import type { MapPlace, MapEvent, MapGuide } from "@/features/map/hooks/use-map-data";

// Free raster tiles derived from OpenStreetMap data, no API key required.
// https://github.com/CartoDB/basemap-styles
const OSM_STYLE = (variant: "light_all" | "dark_all") => ({
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [`https://basemaps.cartocdn.com/${variant}/{z}/{x}/{y}{r}.png`],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
      maxzoom: 20,
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
});

export function MapView({
  center,
  zoom,
  places,
  events,
  guides,
}: {
  center: { latitude: number; longitude: number };
  zoom: number;
  places: MapPlace[];
  events: MapEvent[];
  guides: MapGuide[];
}) {
  const { resolvedTheme } = useTheme();
  const mapRef = React.useRef<MapRef | null>(null);
  const { selected, select, flyToRequest } = useMapStore();

  React.useEffect(() => {
    if (!flyToRequest || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToRequest.longitude, flyToRequest.latitude],
      zoom: flyToRequest.zoom ?? 16,
      duration: 1200,
    });
  }, [flyToRequest]);

  const mapStyle = React.useMemo(
    () => OSM_STYLE(resolvedTheme === "dark" ? "dark_all" : "light_all"),
    [resolvedTheme],
  );

  return (
    <Map
      ref={mapRef}
      initialViewState={{ latitude: center.latitude, longitude: center.longitude, zoom }}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      reuseMaps
      onMove={(_e: ViewStateChangeEvent) => {}}
    >
      <NavigationControl position="bottom-right" />
      <GeolocateControl position="bottom-right" trackUserLocation showAccuracyCircle={false} />

      {places.map((place) => (
        <Marker
          key={`place-${place.id}`}
          longitude={place.longitude}
          latitude={place.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            select({ type: "place", slug: place.slug });
          }}
        >
          <button aria-label={place.nameRu} className="cursor-pointer">
            <PlacePin
              color={place.category.color}
              icon={place.category.icon}
              featured={place.isFeatured}
              active={selected?.type === "place" && selected.slug === place.slug}
            />
          </button>
        </Marker>
      ))}

      {events.map((event) => (
        <Marker
          key={`event-${event.id}`}
          longitude={event.longitude}
          latitude={event.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            select({ type: "event", slug: event.slug });
          }}
        >
          <button aria-label={event.titleRu} className="cursor-pointer">
            <EventPin
              color={event.category.color}
              icon={event.category.icon}
              isLiveNow={event.timing.isLiveNow}
              active={selected?.type === "event" && selected.slug === event.slug}
            />
          </button>
        </Marker>
      ))}

      {guides.map((guide) => {
        const point = guide.places[0] ?? guide.city;
        return (
          <Marker
            key={`guide-${guide.id}`}
            longitude={point.longitude}
            latitude={point.latitude}
            anchor="center"
            offset={[0, -28]}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              select({ type: "guide", slug: guide.slug });
            }}
          >
            <button aria-label={guide.name} className="cursor-pointer">
              <GuidePin
                avatar={guide.avatar}
                active={selected?.type === "guide" && selected.slug === guide.slug}
              />
            </button>
          </Marker>
        );
      })}
    </Map>
  );
}
