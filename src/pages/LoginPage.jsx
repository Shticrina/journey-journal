import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from "../supabase";

const LoginPage = ({ onLogin }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState(null);
	const [showResend, setShowResend] = useState(false);
	const [message, setMessage] = useState("");
	const { user, loading } = useAuth();
	const navigate = useNavigate(); // For navigation after login

	// 🔹 If already logged in, redirect
	useEffect(() => {
		if (!loading && user) {
		navigate("/dashboard");
		}
	}, [user, loading, navigate]);

	const handleLogin = async (e) => {
		e.preventDefault();
		setMessage('');
		setShowResend(false);

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				// Special case: email not confirmed
				if (error.message.includes("Email not confirmed")) {
					setMessage("Please confirm your email before logging in. Check your inbox.");
				} else {
					setMessage(error.message);
				}
				return;
			}

			navigate("/dashboard");
			setMessage("Login successful! Redirecting to dashboard...");
			console.log("Login successful:", data);
		} catch (error) {
			setMessage("Something went wrong. Please try again.");
			console.error("Login failed:", error.message);
		}
	};

	const handleResend = async () => {
		try {
		const { error } = await supabase.auth.resend({
			type: "signup",
			email,
		});

		if (error) throw error;
			setMessage("Confirmation email resent! Please check your inbox.");
			setShowResend(false);
		} catch (err) {
			console.error("Resend failed:", err.message);
			setMessage("Could not resend confirmation. Please try again later.");
		}
	};

	return (
		<div className="w-full flex items-center justify-center min-h-screen bg-bluegray-light p-4">
			<div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
				<h2 className="text-3xl font-bold text-center text-bluegray-dark mb-8">Login to Travelin</h2>

				{message && (
					<div className="mb-4 text-center text-sm text-salmon-primary font-semibold">
						{message}
						{showResend && (
							<button
								onClick={handleResend}
								className="ml-2 underline text-bluegray-dark hover:text-salmon-primary"
							>
								Resend Email
							</button>
						)}
					</div>
				)}

				<form onSubmit={handleLogin}>
					<div className="mb-4">
						<label htmlFor="email" className="block text-bluegray-dark text-sm font-bold mb-2">
							Email
						</label>
						<input
							type="email"
							id="email"
							className="shadow appearance-none border rounded w-full py-2 px-3 text-bluegray-dark leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
							placeholder="your@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="password" className="block text-bluegray-dark text-sm font-bold mb-2">
							Password
						</label>
						<input
							type="password"
							id="password"
							className="shadow appearance-none border rounded w-full py-2 px-3 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{errorMsg && (
						<div className="mb-4 text-red-500 text-sm">{errorMsg}</div>
					)}

					<div className="flex items-center justify-between">
						<button
							type="submit"
							className="btn-primary"
						>
							Sign In
						</button>
						<a href="/signup" className="inline-block align-baseline font-bold text-sm text-bluegray-dark hover:text-salmon-primary">
							Don't have an account? Sign Up!
						</a>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;