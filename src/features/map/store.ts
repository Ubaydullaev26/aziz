import { create } from "zustand";

export type SelectedEntity = { type: "place" | "event" | "guide"; slug: string } | null;

export type FlyToRequest = { longitude: number; latitude: number; zoom?: number; ts: number };

interface MapFiltersState {
  activeCategories: string[];
  showGuides: boolean;
  toursOnly: boolean;
  selected: SelectedEntity;
  flyToRequest: FlyToRequest | null;
  initCategories: (keys: string[]) => void;
  toggleCategory: (key: string) => void;
  setAllCategories: (keys: string[], value: boolean) => void;
  toggleGuides: () => void;
  toggleToursOnly: () => void;
  select: (sel: SelectedEntity) => void;
  requestFlyTo: (longitude: number, latitude: number, zoom?: number) => void;
}

export const useMapStore = create<MapFiltersState>((set, get) => ({
  activeCategories: [],
  showGuides: false,
  toursOnly: false,
  selected: null,
  flyToRequest: null,
  initCategories: (keys) => {
    if (get().activeCategories.length === 0) set({ activeCategories: keys });
  },
  toggleCategory: (key) =>
    set((state) => ({
      activeCategories: state.activeCategories.includes(key)
        ? state.activeCategories.filter((k) => k !== key)
        : [...state.activeCategories, key],
    })),
  setAllCategories: (keys, value) => set({ activeCategories: value ? keys : [] }),
  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
  toggleToursOnly: () => set((state) => ({ toursOnly: !state.toursOnly })),
  select: (sel) => set({ selected: sel }),
  requestFlyTo: (longitude, latitude, zoom) => set({ flyToRequest: { longitude, latitude, zoom, ts: Date.now() } }),
}));
