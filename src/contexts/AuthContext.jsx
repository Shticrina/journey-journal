import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "../supabase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Load active session on first mount
		const getInitialSession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (error) console.error("Error getting session:", error);

			setSession(data?.session ?? null);
			setUser(data?.session?.user ?? null);
			setLoading(false);
		};

		getInitialSession();

		// Subscribe to auth changes (login, logout, refresh)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);
			setUser(newSession?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Logout helper
	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) console.error("Error signing out:", error);
		// user & session will be reset automatically by onAuthStateChange
	};

	return (
		<AuthContext.Provider value={{ user, session, loading, signOut }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};