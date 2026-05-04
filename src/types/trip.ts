export interface Review {
  rating: number;
  text: string;
}

export interface Trip {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  category: string;
  coords: [number, number]; // [lng, lat]
  dates: { from: string; to: string };
  cover: string;
  gallery: string[];
  videos: string[];
  review: Review;
  notes?: string;
}
