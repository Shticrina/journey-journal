import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { UserIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { tripsApi } from "../services/tripService";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { CameraIcon } from "@heroicons/react/24/outline";
import { truncateText } from "../utils/truncateText";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DashboardPage = () => {
	const modalRef = useRef(null);
	const [isAddingTrip, setIsAddingTrip] = useState(false);
	const [newTrip, setNewTrip] = useState({
		title: "",
		location: "",
		country: "",
		category_id: "",
		date: "", // formatted date like "April 2023"
		dateValue: "", // technical date value like "2023-04"
		budget:  "",
		description: "",
		coords: ['', ''], // jsonb
		images: [] // jsonb
	});
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [isDragging, setIsDragging] = useState(false);
	const [trips, setTrips] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeCategory, setActiveCategory] = useState('All');
	const { user, session } = useAuth();
	const [visibleCount, setVisibleCount] = useState(3);
	const [scale, setScale] = useState(150);
	
	// Fetch trips and categories
	useEffect(() => {
		const  fetchTrips = async ()=> {
			try {
				const data = await tripsApi.getTrips(session.access_token);
				// const { data, error } = await supabase
				// 	.from("trips")
				// 	.select(`
				// 		*,
				// 		category:categories(name)
				// 	`);

				setTrips(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}

		const fetchCategories = async ()=> {
			try {
				const data = await tripsApi.getCategories();
				setCategories(data);
			} catch (error) {
				console.error(error);
			}
		}

		fetchTrips();
		fetchCategories();
	}, []);

	// Handle map scale based on window width
	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;

			if (width < 360) setScale(200);      // mobile
			else if (width < 450) setScale(180); // tablet
			else setScale(170);                  // desktop
		};

		handleResize(); // initial scale
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleLoadMore = () => {
		setVisibleCount((prev) => prev + 3);
	};

   const handleAddTrip = async(e) => {
		e.preventDefault();
		setIsAddingTrip(true);

		try {
			const imageUrls = [];

			for (const file of imageFiles) {
				const fileName = `${user.id}/${uuidv4()}-${file.name}`;

				const { data, error } = await supabase.storage
					.from('trip-images') // The bucket name: 'trip-images'
					.upload(fileName, file);

				if (error) {
					console.error('Error uploading image:', error);
					continue;
				} // https://mmybpjijwhgzjictowfg.supabase.co/storage/v1/object/public/trip-images/ac3de617-abaa-4716-affc-339d644cb829/1d324b08-1beb-4d59-9120-85a1e56c5207-eva-wilcock-cqOhoFEbXWo-unsplash.jpg
				// https://mmybpjijwhgzjictowfg.supabase.co/storage/v1/object/public/trip-images/c4289165-ad6c-44da-a6e7-ae5180be23be/e772985d-43fb-413d-8541-6f4645b928bf-mr-sobau-eDyMfA1OyC8-unsplash.jpg
			

				// Get the public URL and store it into imageUrls array
				const { data: { publicUrl } } = supabase.storage
					.from('trip-images')
					.getPublicUrl(fileName);

				imageUrls.push(publicUrl);
			}

			// Convert coords from strings to numbers
			const numericCoords = [
				parseFloat(newTrip.coords[0]), 
				parseFloat(newTrip.coords[1])
			];

			// Prepare the trip data with proper format
			const tripData = {
				...newTrip,
				user_id: user.id,
				coords: numericCoords,
				images: imageUrls
			};
			console.log("Final trip data to submit:", tripData);
			delete tripData.dateValue;

			// Send data to API
			const newTripResponse = await tripsApi.createTrip(tripData, session.access_token);
			console.log("Trip created:", newTripResponse);

			 // Update UI with the new trip
			setTrips(prevTrips => [tripData, ...prevTrips]);

			// Reset newTrip form
			setNewTrip({
				title: "", location: "", category_id: "", country: "", date: "",
				dateValue: "", budget: "", description: "", coords: ['', ''], images: []
			});
			setImageFiles([]);
			setImagePreviews([]);
			setIsAddingTrip(false);
		} catch (error) {
			console.error("Error creating trip:", error);
		}
	};

    const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		setImageFiles(prev => [...prev, ...files]);

		// Create previews
		files.forEach(file => {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreviews(prev => [...prev, reader.result]);
				// setNewTrip(prev => ({
				// 	...prev,
				// 	images: [...prev.images, reader.result]
				// }));
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index) => {
		setImageFiles(prev => prev.filter((_, i) => i !== index));
		setImagePreviews(prev => prev.filter((_, i) => i !== index));
	};

	const handleClickOutside = (event) => {
		if (modalRef.current && !modalRef.current.contains(event.target)) {
			setIsAddingTrip(false);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		
		const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
			file.type.startsWith('image/')
		);

		if (droppedFiles.length > 0) {
			setImageFiles(prev => [...prev, ...droppedFiles]);

			// Create previews for dropped files
			droppedFiles.forEach(file => {
				const reader = new FileReader();
				reader.onloadend = () => {
					setImagePreviews(prev => [...prev, reader.result]);
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const hashString = (str) => {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return hash;
	}

	// Function to generate pastel colors
	const pastelColorFromString = (str) =>{
		const hash = hashString(str);
		const choice = hash % 3; // 0 = purple, 1 = pink, 2 = orange
		let r, g, b;
		if (choice === 0) {
			// Medium Purple (orchid/lavender vibes)
			r = 160 + (hash % 30); // 160–189
			g = 120 + (hash % 30); // 120–149
			b = 200 + (hash % 30); // 200–229
		} else if (choice === 1) {
			// Medium Pink (rose / watermelon vibes)
			r = 220 + (hash % 20); // 220–239
			g = 100 + (hash % 30); // 100–129
			b = 140 + (hash % 30); // 140–169
		} else {
			// Medium Salmon (peach / coral vibes)
			r = 240 + (hash % 10); // 240–249
			g = 130 + (hash % 30); // 130–159
			b = 110 + (hash % 20); // 110–129
		}
		return `rgb(${r}, ${g}, ${b})`;
	}

	// Filter trips by category
	const getFilteredTrips = () => {
		if (trips.length > 0) {
			// Assign a random pastel color for each category
			trips.forEach(trip => {
				if (trip.categoryColor === undefined && trip.category && trip.category.name) {
					trip.categoryColor = pastelColorFromString(trip.category.name);
				}
			});
		}

		if (activeCategory === 'All') {
			return trips;
		}
		return trips.filter(trip => trip.category.name === activeCategory);
	};

	 // Handle body scroll on modal open/ close
	useEffect(() => {
		if (isAddingTrip) {
			document.addEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		// Cleanup on unmount
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'unset';
		};
	}, [isAddingTrip]);

  return (
    <div className="relative w-full bg-bluegray-light min-h-screen">
		{/* Hero Map Section */}
		<div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] overflow-hidden">
			{/* World Map */}
			<ComposableMap
				projectionConfig={{ scale: scale }}
				width={1000}
				height={540}
				style={{ width: "100%", height: "100%" }}
			>
				<Geographies geography={geoUrl}>
					{({ geographies }) =>
						geographies.map((geo) => (
							<Geography
								key={geo.rsmKey}
								geography={geo}
								fill="#97a8b9"
								stroke="#d9e0e6"
								strokeWidth={0.2}
							/>
						))
					}
				</Geographies>

				{trips.map((trip) => (
					<Marker key={`maptrip-${trip.id}`} coordinates={trip.coords}>
						<circle r={5} fill="#FA8072" stroke="#fff" strokeWidth={2} />
					</Marker>
				))}
			</ComposableMap>

			{/* Top Right Controls */}
			<div className="absolute top-4 lg:top-6 right-0 w-full">
				<div className="max-w-7xl mx-auto flex justify-end items-center space-x-4 px-4 sm:px-6 lg:px-8">
					<button
						onClick={() => setIsAddingTrip(true)}
						className="flex items-center space-x-2 btn-primary px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg"
					>
						<PlusCircleIcon className="h-5 w-5" />
						<span>Add Trip</span>
					</button>
				</div>
			</div>

			{/* Bottom Left Title & Button */}
			<div className="absolute bottom-8 sm:bottom-12 md:bottom-14 lg:bottom-16 left-0 w-full">
				<div className="max-w-7xl mx-auto flex flex-col space-y-3 md:space-y-4 lg:space-y-6 px-4 sm:px-6 lg:px-8">
					<h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-bluegray-dark">
						My Trips
					</h2>

					<button className="w-fit flex justify-center items-center btn-primary px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg">
						Start Journey
					</button>
				</div>
			</div>
		</div>

		{/* Modal for adding trip form */}
		{isAddingTrip && (
			<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
				{/* Modal Content */}
				<div 
					ref={modalRef}
					className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
				>
					<div className="w-full px-4 sm:px-6 lg:px-10 py-4 bg-gray-50 rounded-t-lg">
						<h2 className="text-2xl sm:text-3xl font-bold px-10">Add New Trip</h2>
					</div>

					<form onSubmit={handleAddTrip} className="pt-8 space-y-4">
						<div className="px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6">
							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Title</label>
								<input
									type="text"
									value={newTrip.title}
									onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
									required
								/>
							</div>

							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">
									Date
								</label>
								<input
									type="month"
									value={newTrip.dateValue}
									onChange={(e) => {
										const technicalDate = e.target.value; // "2023-04"
										const date = new Date(technicalDate);
										const formattedDate = date.toLocaleString('en-US', {
											month: 'long',
											year: 'numeric'
										});
										setNewTrip({
											...newTrip, 
											dateValue: technicalDate,
											date: formattedDate
										});
									}}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
								/>
							</div>
						</div>

						<div className="px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6">
							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Location</label>
								<input
									type="text"
									value={newTrip.location}
									onChange={(e) => setNewTrip({...newTrip, location: e.target.value})}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
									required
								/>
							</div>

							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Country</label>
								<input
									type="text"
									value={newTrip.country}
									onChange={(e) => setNewTrip({...newTrip, country: e.target.value})}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
								/>
							</div>
						</div>

						<div className="px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6">
							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Longitude</label>
								<input
									type="text"
									value={newTrip.coords[0]}
									onChange={(e) => setNewTrip({ ...newTrip, coords: [e.target.value, newTrip.coords[1]] })}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
									placeholder="e.g. 48.8566"
									required
								/>
							</div>

							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Latitude</label>
								<input
									type="text"
									value={newTrip.coords[1]}
									onChange={(e) => setNewTrip({ ...newTrip, coords: [newTrip.coords[0], e.target.value] })}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
									placeholder="e.g. 4.4326"
									required
								/>
							</div>
						</div>

						<div className="px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6">
							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Category</label>
								<select
									value={newTrip.category_id}
									onChange={(e) => {
										const selectedCat = categories.find(cat => cat.id === parseInt(e.target.value));
										if (selectedCat) {
											setNewTrip(prev => ({
											...prev,
											category_id: selectedCat.id,
											category: selectedCat,
											category_name: selectedCat.name
											}));
										}
									}}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
									required
								>
									<option value="">Select a category</option>
									{categories.map(category => (
										<option key={`categoryoption-${category.id}`} value={category.id}>{category.name}</option>
									))}
								</select>
							</div>

							<div className="w-ful sm:w-1/2">
								<label className="block text-sm font-medium mb-1">Budget Amount</label>
								<input
									type="text"
									value={newTrip.budget}
									onChange={(e) => setNewTrip({...newTrip, budget: e.target.value})}
									className="w-full border rounded-lg p-2 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
								/>
							</div>
						</div>

						<div className="px-4 sm:px-6 lg:px-10">
							<label className="block text-sm font-medium mb-1">Description</label>
							<textarea
								value={newTrip.description}
								onChange={(e) => setNewTrip({...newTrip, description: e.target.value})}
								className="w-full border rounded-lg p-2 h-20 text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary"
							/>
						</div>

						{/* Images */}
						<div className="px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row md:justify-between md:space-x-8 mt-2">
							<div className="w-full md:w-1/2 -mt-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Images
								</label>

								<label
									htmlFor="file-upload"
									className={`h-32 sm:h-40 md:h-52 mt-1 flex justify-center items-center px-6 border-2  border-gray-300 border-dashed rounded-lg cursor-pointer text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary transition-colors
										${isDragging ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
								>
									<div className="space-y-1 text-center">
										<svg
											className="mx-auto h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-gray-400"
											stroke="currentColor"
											fill="none"
											viewBox="0 0 48 48"
											aria-hidden="true"
											>
											<path
												d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>

										<div className="flex items-center space-x-1 text-sm text-gray-500">
											<span>Upload images</span>
											<input
												id="file-upload"
												name="file-upload"
												type="file"
												multiple
												accept="image/*"
												className="sr-only"
												onChange={handleImageUpload}
											/>
											<p className="">or drag and drop</p>
										</div>
										<p className="text-gray-400 text-sm sm:text-base">(PNG, JPG, GIF up to 10MB)</p>
									</div>
								</label>
							</div>

							{/* Image Previews */}
							<div className="w-full md:w-1/2 overflow-y-auto max-h-60">
								{imagePreviews.length > 0 && (
									<div className="mt-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-3 gap-4">
										{imagePreviews.map((preview, index) => (
										<div key={index} className="relative">
											<img
												src={preview}
												alt={`Preview ${index + 1}`}
												className="h-24 w-full object-cover rounded-lg"
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
											>
												<svg
													className="h-4 w-4"
													fill="none"
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="w-full px-4 sm:px-6 lg:px-10 py-4 mt-12 bg-gray-50 rounded-b-lg">
							<div className="flex justify-between sm:justify-end gap-3 sm:gap-4">
								<button
									type="button"
									onClick={() => setIsAddingTrip(false)}
									className="btn w-full sm:w-fit"
								>
									Cancel
								</button>

								<button
									type="submit"
									className="btn-primary w-full sm:w-fit"
								>
									Save Trip
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		)}

		<div className="max-w-7xl mx-auto bg-bluegray-light pb-20 px-4 sm:px-6 lg:px-8 pt-4">
			{/* Filters */}
			<div className="flex flex-wrap justify-center items-center gap-4 px-4 sm:px-8 bg-white shadow rounded-lg py-4">
				<button 
					className={`px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg ${activeCategory === 'All' ? 'btn-secondary' : 'btn'}`}
					onClick={() => setActiveCategory('All')}
				>
					All Trips
				</button>

				{categories.map(category => (
					<button
						key={`category-${category.id}`}
						className={`px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg ${activeCategory === category.name ? 'btn-secondary' : 'btn'}`}
						onClick={() => setActiveCategory(category.name)}
					>
						{category.name}
					</button>
				))}
			</div>

			{/* Trips Grid */}
			{loading ? (
				<div className="text-center mt-10 pb-10">Loading trips...</div>
			) : getFilteredTrips().length === 0 ? (
				<div className="text-center mt-10 pb-20">No trips found.</div>
			) : (<>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 mt-10">
					{getFilteredTrips().slice(0, visibleCount).map((trip) => (
						<Link
							key={`trip-${trip.id}`}
							to={`/trip/${trip.id}`}
							className="relative bg-white rounded-lg shadow hover:shadow-lg hover:opacity-85 overflow-hidden"
						>
							{trip.images && trip.images.length > 0 ? (
								<img
									src={trip.images[0]}
									alt={trip.title}
									className="h-48 w-full object-cover"
								/>
							) : (
								<div className="h-48 w-full bg-bluegray-medium flex items-center justify-center text-white">
									No Image
								</div>
							)}

							<div 
								className="absolute top-4 left-4 px-3 py-1 text-sm rounded-full text-white font-semibold flex items-center justify-center opacity-85"
								style={{ backgroundColor: trip.categoryColor || '#ccc'}}>
								{trip.category.name}
							</div>

							<div className="absolute top-4 right-4 inline-flex items-center gap-2 px-2 py-1 bg-white/80 text-xs rounded-full text-salmon-primary font-bold">
								<CameraIcon className="h-4 w-4 size-6" />
								<span className="text-bluegray-dark">{trip.images && trip.images.length > 0 ? trip.images.length : 0}</span>
							</div>

							<div className="p-4">
								<h3 className="text-2xl font-bold text-bluegray-dark">
									{trip.title}
								</h3>
								<p className="text-lg text-bluegray-dark font-normal mt-1">
									{trip.country} | {trip.date}
								</p>
								<p className="mt-2 text-sm text-bluegray-medium font-normal">
									{truncateText(trip.description, 230)}
								</p>
							</div>
						</Link>
					))}
				</div>

				{/* Load More */}
				{visibleCount < getFilteredTrips().length && (
					<div className="text-center mt-6">
						<button 
							onClick={handleLoadMore}
							className="btn-secondary hover:bg-bluegray-dark hover:text-white px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg"
						>
							Load More
						</button>
					</div>
				)}
			</>)}
		</div>
    </div>
  );
};

export default DashboardPage;
