export type City = {
  city: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
  population?: number;
};

export type EonetGeometry = {
  coordinates?: number[];
  date?: string;
  type?: string;
};