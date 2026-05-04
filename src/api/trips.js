// import axios from 'axios';
const express = require('express');
const router = express.Router();

let trips = [
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

// Get all trips
router.get('/', (req, res) => {
    res.json(trips);
});

// Get single trip by ID
router.get('/:id', (req, res) => {
    const trip = trips.find(t => t.id === req.params.id);
    if (trip) {
        res.json(trip);
    } else {
        res.status(404).send('Trip not found');
    }
});

// Create a new trip
router.post('/', (req, res) => {
    const newTrip = { id: Date.now().toString(), ...req.body };
    trips.push(newTrip);
    res.status(201).json(newTrip);
});

// Update an existing trip
router.put('/:id', (req, res) => {
    const index = trips.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        trips[index] = { ...trips[index], ...req.body };
        res.json(trips[index]);
    } else {
        res.status(404).send('Trip not found');
    }
});

// Delete a trip
router.delete('/:id', (req, res) => {
    const index = trips.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
        trips = trips.filter(t => t.id !== req.params.id);
        res.status(204).send();
    } else {
        res.status(404).send('Trip not found');
    }
});

module.exports = router;

// const BASE_URL = 'http://localhost:3000/api'; // adjust this to your API URL

// export const tripsApi = {
//   // Get all trips
//   getTrips: async () => {
//     const response = await axios.get(`${BASE_URL}/trips`);
//     return response.data;
//   },

//   // Get single trip by ID
//   getTrip: async (id) => {
//     const response = await axios.get(`${BASE_URL}/trips/${id}`);
//     return response.data;
//   },

//   // Create new trip
//   createTrip: async (tripData) => {
//     const formData = new FormData();
    
//     // Append trip data
//     Object.keys(tripData).forEach(key => {
//       if (key === 'images') {
//         tripData[key].forEach(image => {
//           formData.append('images', image);
//         });
//       } else {
//         formData.append(key, JSON.stringify(tripData[key]));
//       }
//     });

//     const response = await axios.post(`${BASE_URL}/trips`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Update trip
//   updateTrip: async (id, tripData) => {
//     const response = await axios.put(`${BASE_URL}/trips/${id}`, tripData);
//     return response.data;
//   },

//   // Delete trip
//   deleteTrip: async (id) => {
//     const response = await axios.delete(`${BASE_URL}/trips/${id}`);
//     return response.data;
//   }
// };