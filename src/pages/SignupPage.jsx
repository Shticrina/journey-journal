import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabase";

const SignupPage = ({ onSignup }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleSignup = async (e) => {
		e.preventDefault();
		setMessage('');

		if (password !== confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		try {
			// Supabase signup
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: name, // this gets stored in user_metadata
					},
					// emailRedirectTo: `${window.location.origin}/dashboard`, // if you enable email verification
					// after clicking email link, user is redirected here
				},
			});

			if (error) throw error;

			// Check if user already exists
			if (data?.user?.identities?.length === 0) {
				setMessage("This email is already registered. Try logging in instead.");
				return;
			}

			// Create profile entry in 'profiles' table
			if (data.user) {
				const { error: profileError } = await supabase
					.from('profiles')
					.insert([
						{
							id: data.user.id,
							full_name: name,
						}
					]);

				if (profileError) return res.status(500).json({ error: profileError.message });
			}

			if (data.user && !data.session) {
				// Email confirmation required
				setMessage("Signup successful! Please check your email to confirm your account.");
				setName("");
				setEmail("");
				setPassword("");
				setConfirmPassword("");
			} else {
				// If email confirmation is disabled, user is logged in immediately
				navigate("/dashboard");
				setMessage("Signup successful! Redirecting to dashboard...");
				console.log("Signup successful:", data);
			}
		} catch (error) {
			console.error("Signup failed:", error.message);
			setMessage(error.message);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-bluegray-light p-4">
			<div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
				<h2 className="text-3xl font-bold text-center text-bluegray-dark mb-8">Create Your Travelin Account</h2>

				{message && (
					<div className="mb-4 text-center text-sm text-salmon-primary font-semibold">
						{message}
					</div>
				)}

				<form onSubmit={handleSignup}>
					<div className="mb-4">
						<label htmlFor="name" className="block text-bluegray-dark text-sm font-bold mb-2">
						Full Name
						</label>
						<input
						type="text"
						id="name"
						className="shadow appearance-none border rounded w-full py-2 px-3 text-bluegray-dark leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
						placeholder="John Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						/>
					</div>
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
					<div className="mb-4">
						<label htmlFor="password" className="block text-bluegray-dark text-sm font-bold mb-2">
							Password
						</label>
						<input
							type="password"
							id="password"
							className="shadow appearance-none border rounded w-full py-2 px-3 text-bluegray-dark leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					<div className="mb-6">
						<label htmlFor="confirmPassword" className="block text-bluegray-dark text-sm font-bold mb-2">
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							className="shadow appearance-none border rounded w-full py-2 px-3 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>
					<div className="flex items-center justify-between">
						<button
							type="submit"
							className="btn-primary"
						>
							Sign Up
						</button>
						<a href="/login" className="inline-block align-baseline font-bold text-sm text-bluegray-dark hover:text-salmon-primary">
							Already have an account? Login!
						</a>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupPage;