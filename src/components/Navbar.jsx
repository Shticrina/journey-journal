import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon } from "@heroicons/react/24/solid";
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
	const { user, signOut , loading } = useAuth();
	const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
	const menuRef = useRef(null); // Add ref for the menu container
	const userMetadata = user?.user_metadata || {};

	const toggleShowUserMenu = (e) => {
		e.stopPropagation();
		setShowUserMenu((prev) => !prev);
	};

	const handleLogoutClick = async () => {
		await signOut();
		setShowUserMenu(false);
		navigate("/"); // Redirect to home
	};
  
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

  return (
    <nav className="w-full bg-bluegray-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col sm:flex-row sm:justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-white flex items-center">
            {/* Simple mountain icon using SVG */}
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-8 sm:size-10 mr-2">
				<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
				<path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
			</svg>
          Travelin
        </Link>

        {/* Links */}
        <div className="hidden md:flex space-x-8 text-bluegray-light font-semibold">
          <Link className="hover:text-salmon-primary transition-colors" to="/">Home</Link>
          <Link className="hover:text-salmon-primary transition-colors" to="/about">About</Link>
          <Link className="hover:text-salmon-primary transition-colors" to="/features">Features</Link>
          <Link className="hover:text-salmon-primary transition-colors" to="/contact">Contact</Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          {loading ? (
            <div className="text-sm text-gray-300">Loading...</div>
          ) : user ? (
			<div className="flex items-center space-x-3 relative" ref={menuRef}>
				<button
					onClick={toggleShowUserMenu}
					className="p-2 rounded-full bg-white hover:bg-bluegray-light"
				>
					<UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-bluegray-dark" />
				</button>
				<div className="text-salmon-primary">Welcome, {userMetadata.full_name}</div>

				{showUserMenu && (
					<div className="absolute top-12 -left-3 w-40 bg-white rounded-lg shadow-lg z-50">
						<button
							onClick={handleLogoutClick}
							className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
						>
								Logout
						</button>
					</div>
				)}
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;