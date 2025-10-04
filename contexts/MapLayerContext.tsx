import React, { createContext, ReactNode, useContext, useState } from 'react';

type MapLayer = {
  id: string;
  name: string;
  url: string;
  maxZoom?: number;
};

type MapLayerContextType = {
  activeLayer: MapLayer | null;
  setLayer: (layer: MapLayer | null) => void;
  toggleLayer: (id: string) => void;
  availableLayers: MapLayer[];
};

const MapLayerContext = createContext<MapLayerContextType | undefined>(undefined);

const layers: MapLayer[] = [
  {
    id: 'temperature',
    name: 'Air Temperature (MERRA2)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MERRA2_2m_Air_Temperature_Monthly/default/2015-10-07/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
    maxZoom: 9,
  },
  {
    id: 'aerosol',
    name: 'Aerosol Optical Depth (MODIS Terra)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Aerosol/default/2015-10-07/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
    maxZoom: 9,
  },
];

export function MapLayerProvider({ children }: { children: ReactNode }) {
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(layers[0]);

  const setLayer = (layer: MapLayer | null) => setActiveLayer(layer);

  const toggleLayer = (id: string) => {
    const next = layers.find((l) => l.id === id);
    setActiveLayer((prev) => (prev?.id === next?.id ? null : next || null));
  };

  return (
    <MapLayerContext.Provider
      value={{ activeLayer, setLayer, toggleLayer, availableLayers: layers }}
    >
      {children}
    </MapLayerContext.Provider>
  );
}

export const useMapLayer = () => {
  const ctx = useContext(MapLayerContext);
  if (!ctx) throw new Error('useMapLayer must be used within a MapLayerProvider');
  return ctx;
};