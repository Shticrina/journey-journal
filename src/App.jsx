import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';
import { useAuth  } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && !user) {
		navigate('/login');
		}
	}, [user, loading, navigate]);
	
	if (loading) return <div className="p-6 text-center">Loading...</div>;

	return user ? children : null;
};

const App = () => {
	return (
		<Router>
			<MainApp />
		</Router>
	);
}

const MainApp = ({onLogin, onLogout, isAuthenticated}) => {
	const { user } = useAuth();
	const location = useLocation();
	const shouldShowFooter = !location.pathname.includes('/trip/');

  return (
    <div className="relative min-h-screen w-full flex flex-col">
		<Navbar user={user} />

		<main className="flex-grow">
				<Routes>
					<Route
						path="/"
						element={user ? <DashboardPage /> : <LandingPageContent />}
					/>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route
						path="/dashboard"
						element={
						<PrivateRoute>
							<DashboardPage />
						</PrivateRoute>
						}
					/>
					<Route
						path="/trip/:id"
						element={
						<PrivateRoute>
							<TripDetailPage />
						</PrivateRoute>
						}
					/>
				</Routes>
		</main>

		{shouldShowFooter && <Footer />}
    </div>
  );
}

const LandingPageContent = () => (
  <>
    <Hero />
    <Features />
  </>
);

export default App;