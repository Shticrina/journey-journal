import axios from 'axios';
import { supabase } from "../supabase";
import API_URL from "../config";
// const BASE_URL = import.meta.env.VITE_API_URL;
// Don't need this anymore, using Supabase for auth!

const authService = {
	// Sign up with email and password
	signUp: async (userData) => {
		try {
			const response = await axios.post(`${API_URL}/auth/signup`, userData);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Error signing up');
		}
	},

	// Sign in with email and password
	signIn: async (credentials) => {
		try {
			const response = await axios.post(`${API_URL}/auth/signin`, credentials);
			// Store token in localStorage
			if (response.data.token) {
				localStorage.setItem('token', response.data.token);
				axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
			}
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Error signing in');
		}
	},

	// Sign in with social provider
	//   signInWithProvider: async (provider) => {
	//     try {
	//       const response = await axios.get(`${API_URL}/auth/${provider}`);
	//       return response.data;
	//     } catch (error) {
	//       throw new Error(error.response?.data?.message || 'Error signing in with provider');
	//     }
	//   },

	// Sign out
	signOut: async () => {
		try {
			await axios.post(`${API_URL}/auth/signout`);
			localStorage.removeItem('token');
			delete axios.defaults.headers.common['Authorization'];
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Error signing out');
		}
	},

	// Get current user
	getCurrentUser: async () => {
		try {
			const response = await axios.get(`${API_URL}/auth/user`);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Error getting current user');
		}
	},

	// Reset password request
	resetPassword: async (email) => {
		try {
		const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
		return response.data;
		} catch (error) {
		throw new Error(error.response?.data?.message || 'Error requesting password reset');
		}
	},

	// Update password
	updatePassword: async (data) => {
		try {
			const response = await axios.put(`${API_URL}/auth/update-password`, data);
			return response.data;
		} catch (error) {
			throw new Error(error.response?.data?.message || 'Error updating password');
		}
	},

	// Setup axios interceptor for token handling
	setupInterceptors: () => {
		axios.interceptors.request.use(async (config) => {
		// Get the current session
		const { data: { session } } = await supabase.auth.getSession();
		
		if (session?.access_token) {
			config.headers.Authorization = `Bearer ${session.access_token}`;
		}
		
		return config;
		});

		axios.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;

			if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh the session
				const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
				
				if (refreshError) throw refreshError;
				
				if (session) {
				// Update the request header with new token
				originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
				return axios(originalRequest);
				}
			} catch (refreshError) {
				// Handle refresh failure (e.g., redirect to login)
				await supabase.auth.signOut();
				window.location.href = '/login'; // Adjust route as needed
				return Promise.reject(refreshError);
			}
			}

			return Promise.reject(error);
		}
		);
	},

	// Initialize auth state
	initializeAuth: async () => {
		const { data: { session } } = await supabase.auth.getSession();
		
		if (session?.access_token) {
		axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
		}
	}
};

// Initialize auth
authService.initializeAuth();
// Setup interceptors
authService.setupInterceptors();

export default authService;