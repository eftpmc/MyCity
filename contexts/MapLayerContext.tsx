import React, { createContext, ReactNode, useContext, useState } from "react";

type LegendStop = {
  value: number;
  color: string;
  label?: string;
};

type MapLegend = {
  title?: string;
  unit?: string;
  min?: number;
  max?: number;
  stops: LegendStop[];
};

type InfoPart = {
  text: string;
  bold?: boolean;
};

type LayerInfo = {
  title: string;
  desc?: string;
  parts?: InfoPart[];
};

type MapLayer = {
  id: string;
  name: string;
  url: string;
  maxZoom?: number;
  legend?: MapLegend;
  info?: LayerInfo;
};

type MapLayerContextType = {
  activeLayer: MapLayer | null;
  setLayer: (layer: MapLayer | null) => void;
  toggleLayer: (id: string) => void;
  availableLayers: MapLayer[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getLayerUrl: (layer: MapLayer) => string;
};

const MapLayerContext = createContext<MapLayerContextType | undefined>(
  undefined
);

/**
 * 🌍 NASA GIBS Layers — with structured, digestible information
 */
const layers: MapLayer[] = [
  // ☁️ AIR QUALITY & ATMOSPHERE
  {
    id: "aerosol",
    name: "MODIS Terra – Aerosol Optical Depth",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Aerosol/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Aerosol Optical Depth",
      parts: [
        {
          text: "Represents the concentration of airborne particles such as dust, smoke, and pollution that scatter or absorb sunlight.",
        },
        {
          text: "Low values (0.0–0.3): Clear atmospheric conditions with high visibility.",
          bold: true,
        },
        {
          text: "High values (>1.0): Dense haze, smoke, or dust that reduces visibility and solar radiation.",
          bold: true,
        },
        {
          text: "Useful for identifying pollution events, regional transport of particulates, and the influence of aerosols on temperature and climate feedbacks.",
        },
      ],
    },
    legend: {
      title: "Aerosol Optical Depth",
      unit: "",
      min: 0.0,
      max: 5.0,
      stops: [
        { value: 0.0, color: "#FFFFB2" },
        { value: 1.0, color: "#FED976" },
        { value: 2.0, color: "#FD8D3C" },
        { value: 3.0, color: "#F03B20" },
        { value: 5.0, color: "#BD0026" },
      ],
    },
  },

  {
    id: "carbon-monoxide",
    name: "AIRS L3 – Carbon Monoxide (500 hPa, Monthly, Day)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/AIRS_L3_Carbon_Monoxide_500hPa_Volume_Mixing_Ratio_Monthly_Day/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Carbon Monoxide (500 hPa)",
      parts: [
        {
          text: "Shows mid-tropospheric carbon monoxide (CO) concentration, an indicator of combustion sources and long-range pollution transport.",
        },
        {
          text: "Low values (0–100 ppbv): Clean background atmosphere with minimal emissions.",
          bold: true,
        },
        {
          text: "High values (>200 ppbv): Pollution from wildfires, industrial emissions, or urban combustion transported by upper-level winds.",
          bold: true,
        },
        {
          text: "Helps trace regional emission sources, identify transport pathways, and evaluate air quality trends over time.",
        },
      ],
    },
    legend: {
      title: "Carbon Monoxide (500 hPa)",
      min: 0,
      max: 350,
      unit: "ppbv",
      stops: [
        { value: 0, color: "#fff4b3" },
        { value: 100, color: "#f46d43" },
        { value: 200, color: "#d73027" },
        { value: 350, color: "#762a83" },
      ],
    },
  },

  // 🌎 LAND SURFACE & VEGETATION
  {
    id: "land-surface-temp",
    name: "MODIS Terra – Land Surface Temperature (L3, Monthly, Day)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Land Surface Temperature",
      parts: [
        {
          text: "Represents the actual temperature of the land surface, influenced by solar radiation, land cover, and moisture.",
        },
        {
          text: "Low values (200–260 K): Cold terrain, snow, or high-elevation regions.",
          bold: true,
        },
        {
          text: "High values (>310 K): Dry or built-up areas absorbing and retaining heat.",
          bold: true,
        },
        {
          text: "Useful for identifying surface heat anomalies, drought stress, and thermal differences between land covers or materials.",
        },
      ],
    },
    legend: {
      title: "Land Surface Temperature",
      unit: "K",
      min: 200.0,
      max: 350.0,
      stops: [
        { value: 200, color: "#4000ff" },
        { value: 240, color: "#00b4ff" },
        { value: 280, color: "#00ff00" },
        { value: 310, color: "#ffff00" },
        { value: 350, color: "#ff0000" },
      ],
    },
  },

  {
    id: "vegetation",
    name: "MISR – NDVI Land Vegetation Index (Monthly Average)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MISR_Land_NDVI_Average_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Vegetation Index (NDVI)",
      parts: [
        {
          text: "Measures vegetation density and vigor based on the difference between near-infrared and red reflectance.",
        },
        {
          text: "Low values (<0.3): Sparse vegetation or impervious surfaces.",
          bold: true,
        },
        {
          text: "High values (>0.6): Dense, healthy vegetation or forested regions.",
          bold: true,
        },
        {
          text: "Indicates vegetation cover, productivity, and drought conditions. Useful for monitoring land degradation, crop performance, and ecological resilience.",
        },
      ],
    },
    legend: {
      title: "NDVI – Land Vegetation Index",
      unit: "",
      min: 0.2,
      max: 1.0,
      stops: [
        { value: 0.2, color: "#4000ff" },
        { value: 0.4, color: "#00b4ff" },
        { value: 0.6, color: "#00ff00" },
        { value: 0.8, color: "#ffff00" },
        { value: 1.0, color: "#ff0000" },
      ],
    },
  },

  // ❄️ CRYOSPHERE
  {
    id: "snow-cover",
    name: "MODIS Terra – Snow Cover (L3, Monthly Average %)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_Snow_Cover_Monthly_Average_Pct/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Snow Cover (%)",
      parts: [
        {
          text: "Shows the fraction of land area covered by snow, affecting albedo, runoff, and water storage cycles.",
        },
        {
          text: "Low values (<25%): Limited or seasonal snow extent.",
          bold: true,
        },
        {
          text: "High values (>75%): Persistent snowpack or glaciated zones.",
          bold: true,
        },
        {
          text: "Important for hydrological modeling, energy balance studies, and monitoring seasonal water supply in snow-fed regions.",
        },
      ],
    },
    legend: {
      title: "Snow Cover (%)",
      unit: "%",
      min: 1,
      max: 100,
      stops: [
        { value: 1, color: "#d8f070" },
        { value: 25, color: "#f0c870" },
        { value: 50, color: "#e6987b" },
        { value: 75, color: "#e88080" },
        { value: 100, color: "#ff0000" },
      ],
    },
  },

  // 🌊 OCEAN & WATER
  {
    id: "sea-surface-temp",
    name: "MODIS Terra – Sea Surface Temperature (L3, 9km, Monthly, Day)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_L3_SST_Thermal_9km_Day_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 9,
    info: {
      title: "Sea Surface Temperature",
      parts: [
        {
          text: "Indicates the temperature of the upper ocean layer, a key factor in weather systems and coastal climate regulation.",
        },
        {
          text: "Low values (<10°C): Cold currents and upwelling zones supporting nutrient-rich ecosystems.",
          bold: true,
        },
        {
          text: "High values (>28°C): Warm tropical waters associated with convection, storms, and coral bleaching events.",
          bold: true,
        },
        {
          text: "Supports monitoring of marine heatwaves, storm potential, and long-term shifts in ocean circulation.",
        },
      ],
    },
    legend: {
      title: "Sea Surface Temperature",
      unit: "°C",
      min: 0.0,
      max: 32.0,
      stops: [
        { value: 0.0, color: "#4B0082" },
        { value: 8.0, color: "#0000CD" },
        { value: 16.0, color: "#00FF00" },
        { value: 24.0, color: "#FFD700" },
        { value: 32.0, color: "#FF4500" },
      ],
    },
  },

  // ☀️ ENERGY & RADIATION
  {
    id: "radiation",
    name: "MERRA-2 – Surface Downward Shortwave Radiation (Monthly)",
    url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MERRA2_Incident_Shortwave_Over_Land_Monthly/default/{date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png",
    maxZoom: 8,
    info: {
      title: "Surface Downward Shortwave Radiation",
      parts: [
        {
          text: "Measures the total solar energy reaching Earth's surface (W/m²).",
        },
        {
          text: "Low values (<150 W/m²): Overcast or high-latitude regions with reduced sunlight.",
          bold: true,
        },
        {
          text: "High values (>350 W/m²): Clear-sky conditions with strong solar exposure.",
          bold: true,
        },
        {
          text: "Used to assess solar energy potential, surface heating effects, and seasonal variation in available radiation.",
        },
      ],
    },
    legend: {
      title: "Surface Downward Shortwave Radiation",
      unit: "W/m²",
      min: 0,
      max: 420,
      stops: [
        { value: 0, color: "#2166AC" },
        { value: 100, color: "#67A9CF" },
        { value: 200, color: "#D1E5F0" },
        { value: 300, color: "#FDAE61" },
        { value: 420, color: "#B2182B" },
      ],
    },
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
  if (!ctx)
    throw new Error("useMapLayer must be used within a MapLayerProvider");
  return ctx;
};