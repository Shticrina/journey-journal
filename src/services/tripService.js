
import axios from 'axios';
import API_URL from "../config";

export const tripsApi = {
	getTrips: async (accessToken) => {
		const response = await axios.get(`${API_URL}/trips`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	},

	getTrip: async (id, accessToken) => {
		const response = await axios.get(`${API_URL}/trips/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	},

	createTrip: async (tripData, accessToken) => {
		const response = await axios.post(`${API_URL}/trips`, tripData, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	},

	updateTrip: async (id, tripData, accessToken) => {
		const response = await axios.put(`${API_URL}/trips/${id}`, tripData, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	},

	deleteTrip: async (id, accessToken) => {
		const response = await axios.delete(`${API_URL}/trips/${id}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		return response.data;
	},

	getCategories: async () => {
		const response = await axios.get(`${API_URL}/categories`);
		return response.data;
	}
};
