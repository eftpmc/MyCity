// contexts/CitiesContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type City = {
  city: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
};

type CitiesContextType = {
  cities: City[];
  addCity: (city: City) => void;
  removeCity: (city: City) => void;
  isAdded: (city: City) => boolean;
};

const CitiesContext = createContext<CitiesContextType | undefined>(undefined);

export function CitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);

  const addCity = (city: City) => {
    if (!isAdded(city)) {
      setCities((prev) => [...prev, city]);
    }
  };

  const removeCity = (city: City) => {
    setCities((prev) =>
      prev.filter(
        (c) => !(c.city === city.city && c.state_id === city.state_id)
      )
    );
  };

  const isAdded = (city: City) =>
    !!cities.find(
      (c) => c.city === city.city && c.state_id === city.state_id
    );

  return (
    <CitiesContext.Provider value={{ cities, addCity, removeCity, isAdded }}>
      {children}
    </CitiesContext.Provider>
  );
}

export function useCities() {
  const ctx = useContext(CitiesContext);
  if (!ctx) throw new Error('useCities must be used inside CitiesProvider');
  return ctx;
}