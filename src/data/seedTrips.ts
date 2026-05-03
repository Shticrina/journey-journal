import type { Trip } from "../types/trip";

export const seedTrips: Trip[] = [
  {
    id: "1",
    title: "Paris Adventure",
    country: "France",
    countryCode: "FR",
    category: "City",
    coords: [2.3522, 48.8566],
    dates: { from: "2023-05-01", to: "2023-05-07" },
    cover: "https://source.unsplash.com/random/800x600/?paris",
    gallery: ["https://source.unsplash.com/random/400x300/?eiffel"],
    videos: [],
    review: { rating: 5, text: "Amazing city!" },
    notes: "Loved the croissants.",
  },
  {
    id: "2",
    title: "Tokyo Lights",
    country: "Japan",
    countryCode: "JP",
    category: "Urban",
    coords: [139.6917, 35.6895],
    dates: { from: "2022-09-10", to: "2022-09-20" },
    cover: "https://source.unsplash.com/random/800x600/?tokyo",
    gallery: ["https://source.unsplash.com/random/400x300/?shibuya"],
    videos: [],
    review: { rating: 4, text: "Futuristic and vibrant!" },
  },
];
