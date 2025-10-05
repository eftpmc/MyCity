import React, { createContext, ReactNode, useContext, useState } from "react";

type MapLayer = {
  id: string;
  name: string;
  url: string; // Template URL with {date}
  maxZoom?: number;
};

type MapLayerContextType = {
  activeLayer: MapLayer | null;
  setLayer: (layer: MapLayer | null) => void;
  toggleLayer: (id: string) => void;
  availableLayers: MapLayer[];
  selectedDate: string; // ISO date string YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  getLayerUrl: (layer: MapLayer) => string;
};

const MapLayerContext = createContext<MapLayerContextType | undefined>(undefined);

/**
 * 🌍 NASA GIBS Layers — all support date substitution.
 * Reference: https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products
 */
const layers: MapLayer[] = [
  // --- Atmosphere / Weather ---
  {
    id: "temperature",
    name: "Air Temperature (MERRA2)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MERRA2_2m_Air_Temperature_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },
  {
    id: "aerosol",
    name: "Aerosol Optical Depth (MODIS Terra)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Aerosol/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },
  {
    id: "carbon-monoxide",
    name: "Carbon Monoxide (MOPITT)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MOPITT_CO_Mixing_Ratio_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
  },
  {
    id: "nitrogen-dioxide",
    name: "Nitrogen Dioxide (OMI)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/OMI_Nitrogen_Dioxide/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
  },

  // --- Surface / Land ---
  {
    id: "land-surface-temp",
    name: "Land Surface Temperature (MODIS Terra)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },
  {
    id: "vegetation",
    name: "Vegetation Index (MODIS Terra)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },
  {
    id: "snow-cover",
    name: "Snow Cover (MODIS Terra)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Snow_Cover/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },

  // --- Ocean / Water ---
  {
    id: "sea-surface-temp",
    name: "Sea Surface Temperature (GHRSST)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GMAP_GHRSST_L4_MUR_Sea_Surface_Temperature/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },
  {
    id: "chlorophyll",
    name: "Chlorophyll Concentration (MODIS Aqua)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Chlorophyll_A/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
  },

  // --- Fire / Hazards ---
  {
    id: "fires",
    name: "Active Fires (VIIRS)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_Thermal_Anomalies_375m_Night/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 10,
  },
  {
    id: "carbon-emissions",
    name: "Carbon Emissions (GFED)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GFED_Burned_Area_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
  },

  // --- Clouds / Radiation ---
  {
    id: "cloud-fraction",
    name: "Cloud Fraction (MODIS Aqua)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Cloud_Fraction_Daily/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
  },
  {
    id: "radiation",
    name: "Surface Downward Shortwave Radiation (CERES)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/CERES_Surface_Downwelling_Shortwave_Flux/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
  },
];

export function MapLayerProvider({ children }: { children: ReactNode }) {
  const [activeLayer, setActiveLayer] = useState<MapLayer | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const setLayer = (layer: MapLayer | null) => setActiveLayer(layer);

  const toggleLayer = (id: string) => {
    const next = layers.find((l) => l.id === id);
    setActiveLayer((prev) => (prev?.id === next?.id ? null : next || null));
  };

  const getLayerUrl = (layer: MapLayer) =>
    layer.url.replace("{date}", selectedDate);

  return (
    <MapLayerContext.Provider
      value={{
        activeLayer,
        setLayer,
        toggleLayer,
        availableLayers: layers,
        selectedDate,
        setSelectedDate,
        getLayerUrl,
      }}
    >
      {children}
    </MapLayerContext.Provider>
  );
}

export const useMapLayer = () => {
  const ctx = useContext(MapLayerContext);
  if (!ctx) throw new Error("useMapLayer must be used within a MapLayerProvider");
  return ctx;
};