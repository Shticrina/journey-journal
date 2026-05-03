import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { UserIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { tripsApi } from "../services/tripService";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const TripDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [showDelete, setShowDelete] = useState(false);
	const [trip, setTrip] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({});
	const [categories, setCategories] = useState([]);
	const [imageFiles, setImageFiles] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [isDragging, setIsDragging] = useState(false);
	const { user, session } = useAuth();

	// Fetch trip details
	useEffect(() => {
		const fetchTrip = async () => {
			try {
				const data = await tripsApi.getTrip(id, session.access_token);
				setTrip(data);
				setFormData(data);
				console.log(data);
			} catch (error) {
				console.error('Error fetching trip:', error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTrip();
	}, [id, session]);
	console.log(trip); // budget, description, coords, images, category, country, date, location

	const handleDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};

	// Fetch categories
	useEffect(() => {
		const fetchCategories = async () => {
			const { data, error } = await supabase.from("categories").select("*");
			if (error) {
				console.error("Error fetching categories:", error);
			} else {
				setCategories(data);
			}
		};
		fetchCategories();
	}, []);
	
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		console.log('---- upload new ----');

		if (files.length > 0) {
			setImageFiles(prev => [...prev, ...files]);

			// Create previews
			files.forEach(file => {
				const previewUrl = URL.createObjectURL(file);

				setImageFiles(prev => [...prev, { file, previewUrl }]);
				setFormData(prev => ({
					...prev,
					images: [...(prev.images || []), previewUrl] // temporary preview URL
				}));
			});
		}
	};

	// Remove image from formData and staging
	const removeImage = (index) => {
		console.log('---- remove ----');
		setImageFiles(prev => prev.filter((_, i) => i !== index));

		setFormData(prev => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index)
		}));
	};
	// console.log('imageFiles', imageFiles); // empty?
	// console.log('formData', formData);

	const handleSave = async () => {
		try {
			let deletedImages = [];
			console.log('-------------save--------------');

			// 1. Find new images (previews only, not uploaded yet)
			const newImages = imageFiles.filter(img => formData.images.includes(img.previewUrl));
			let uploadedUrls = [];
			// console.log('newImages', newImages);

			// Upload new images if any
			for (const newImg of newImages) {
				const file = newImg.file;
				const filePath = `${user.id}/${uuidv4()}-${file.name}`;
				const { error } = await supabase.storage
					.from("trip-images")
					.upload(filePath, file);

				if (error) {
					console.error("Error uploading image:", error);
					continue;
				} 

				// Get the public URL and store it into imageUrls array
				const { data: { publicUrl } } = supabase.storage
					.from('trip-images')
					.getPublicUrl(filePath);
				uploadedUrls.push(publicUrl);
			}

			// 2. Find deleted images (those in original trip but missing now)
			if (trip && trip.images) {
				deletedImages = trip.images.filter(img => !formData.images.includes(img));
				if (deletedImages.length > 0) {
					const paths = deletedImages.map(url => url.split("/").pop());
					await supabase.storage.from("trip-images").remove(paths);
				}
			}

			// 3. Finalize images = keep only originals still present + newly uploaded
			const finalImages = [
				...(
					Array.isArray(formData.images) && Array.isArray(trip.images)
					? formData.images.filter(img => trip.images.includes(img))
					: []
				),
				...uploadedUrls
			] || [];

			const updatedTrip = { ...formData, images: finalImages, category_id: parseInt(formData.category_id) };
			console.log('updatedTrip', updatedTrip);
		
			const updated = await tripsApi.updateTrip(id, updatedTrip, session.access_token);
			setTrip(updatedTrip);
			setFormData(updatedTrip);
			setImageFiles([]); // reset after upload
			setImagePreviews([]); // reset after upload
			setIsEditing(false);
		} catch (err) {
			console.error("Error updating trip:", err);
		}
	};

	const handleDelete = async () => {
		try {
			console.log('---- try delete ----');
			const response = await tripsApi.deleteTrip(id, session.access_token);
			console.log('delete response', response);
			// if (error) throw error;

			// Delete associated images from storage
			if (trip.images && trip.images.length > 0) {
				const imagePaths = trip.images.map(url => url.split('/').pop());
				const { error: storageError } = await supabase.storage
					.from('trip-images')
					.remove(imagePaths);

				if (storageError) throw storageError;
			}

			setShowDelete(false)
			navigate('/dashboard');
		} catch (error) {
			console.error('Error deleting trip:', error);
			// Add error handling UI here
			setError(error.message);
			setShowDelete(false);
		}
	};
	// New York lights, -73.93524, 40.73061

	return (
		<div className="max-w-7xl mx-auto min-h-screen px-6 sm:px-8 py-10">
			<div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0 sm:justify-between sm:items-center mb-6">
				<button
					onClick={() => navigate("/dashboard")}
					className="btn-link w-fit"
				>
					← Back to Dashboard
				</button>

				{/* Buttons */}
				<div className="flex justify-between sm:justify-end space-x-3">
					{isEditing ? (
						<>
							<button onClick={handleSave} className="btn-primary px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg">Save</button>
							<button onClick={() => setIsEditing(false)} className="btn px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg">Cancel</button>
						</>
						) : (
						<>
							<button onClick={() => setIsEditing(true)} className="btn px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg">Edit Trip</button>
							<button onClick={() => setShowDelete(true)} className="btn-primary px-5 py-1.5 lg:px-6 lg:py-2 text-md lg:text-lg">Delete Trip</button>
						</>
					)}
				</div>
			</div>

			{/* Title */}
			<div className="w-full lg:w-3/5 mt-10 sm:mt-0">
				{isEditing ? (<>
					<label className="block text-sm font-medium mb-1">Title</label>
					<input
						type="text"
						name="title"
						value={formData.title || ""}
						onChange={handleChange}
						className="w-full text-3xl md:text-4xl font-bold border p-2 h-16 rounded-lg"
					/>
				</>) : (
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">{trip?.title}</h2>
				)}
			</div>

			<div className="flex flex-col lg:flex-row justify-between space-y-8 lg:space-y-0 lg:space-x-12 h-auto mt-2 sm:mt-4 lg:mt-6">
				{/* Map */}
				<div className="w-full lg:w-3/5">
					<div className="bg-white shadow rounded-lg">
						{trip && trip.coords && (
							<ComposableMap 
								projection="geoEqualEarth"
								projectionConfig={{ center: trip.coords, scale: 800 }} 
								width={800}
								height={500}
								className="w-full h-full"
							>
								<Geographies geography={geoUrl}>
									{({ geographies }) =>
									geographies.map((geo) => (
										<Geography
											key={geo.rsmKey}
											geography={geo}
											fill="#E2E8F0"
											stroke="#CBD5E0"
										/>
									))
									}
								</Geographies>
								<Marker coordinates={trip.coords}>
									<circle r={8} fill="#FA8072" stroke="#fff" strokeWidth={2} />
								</Marker>
							</ComposableMap>
						)}
					</div>

					<div className="w-full flex justify-end items-center mt-1 space-x-2">
						{isEditing ? (<>
							<label className="block text-sm font-medium mb-1">Location</label>
							<input
								type="text"
								name="location"
								value={formData.location || ""}
								onChange={handleChange}
								className="border p-2 rounded-lg text-gray-500"
							/>
						</>) : (
							<p className="text-lg text-bluegray-dark font-semibold">{trip?.location}</p>
						)}
					</div>
				</div>

				{/* Details */}
				<div className="details w-full lg:w-2/5">
					{/* Country and date */}
					{isEditing && (
						<div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-end sm:space-x-4 -mt-2">
							<div className="w-full flex flex-col">
								<label className="block text-sm font-medium mb-1">Country</label>
								<input
									type="text"
									name="country"
									value={formData.country || ""}
									onChange={handleChange}
									className="border p-2 rounded-lg text-gray-500"
								/>
							</div>

							<div className="w-full flex flex-col">
								<label className="block text-sm font-medium mb-1">Date</label>
								<input
									type="text"
									name="date"
									value={formData.date || ""}
									onChange={handleChange}
									className="border p-2 rounded-lg text-gray-500"
								/>
							</div>
						</div>
					)}

					{!isEditing &&  (
						<div className="flex space-x-2 -mt-2">
							<p className="text-2xl md:text-3xl text-bluegray-dark font-semibold">
								{trip?.country} 
							</p>
							<p className="text-2xl md:text-3xl text-bluegray-medium font-semibold">|</p>
							<p className="text-2xl md:text-3xl text-bluegray-medium font-semibold">
								{trip?.date}
							</p>
						</div>
					)}

					{/* Description */}
					<div className="w-full">
						{isEditing ? (<>
							<label className="block text-sm font-medium mb-1 mt-4">Description</label>
							<textarea
								rows={6}
								name="description" 
								value={formData.description || ""}
								onChange={handleChange}
								className="w-full border p-2 rounded-lg text-gray-500"
							/>
						</>) : (
							<p className="text-md md:text-lg mt-6">{trip?.description}</p>
						)}
					</div>

					{/* Budget */}
					<div className="w-full">
						{isEditing ? (<>
							<label className="block text-sm font-medium mb-1 mt-4">Budget</label>
							<input
								type="text"
								name="budget"
								value={formData.budget || ""}
								onChange={handleChange}
								className="w-full border p-2 rounded-lg text-gray-500"
							/>
						</>) : (
							<p className="mt-6"><strong>Budget:</strong> €{trip?.budget}</p>
						)}
					</div>

					{/* Category */}
					<div className="">
						{isEditing ? (<>
							<label className="block text-sm font-medium mb-1 mt-5">Category</label>
							<select
								name="category_id"
								value={formData.category_id || ""}
								onChange={(e) => {
									const selectedCat = categories.find(cat => cat.id === parseInt(e.target.value));
									if (selectedCat) {
										setFormData(prev => ({
											...prev,
											category_id: e.target.value,
											category: selectedCat
										}));
									}
								}}
								className="w-full border p-2 rounded-lg text-gray-500"
							>
								<option value="">Select a category</option>
								{categories.map((cat) => (
									<option key={`categoryoption-${cat.id}`} value={cat.id}>
										{cat.name}
									</option>
								))}
							</select>
						</>) : (
							<p className="mt-2"><strong>Category:</strong> {trip?.category?.name}</p>
						)}
					</div>
				</div>
			</div>

			{/* Visual Memories */}
			<div className="mt-12">
				<h3 className="mt-12 text-3xl md:text-4xl font-bold text-bluegray-dark">
					Visual Memories
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4">
					{(formData.images || []).map((img, idx) => (
						<div key={`gallery-img-${idx}`} className="relative">
							<img
								src={img} 
								alt="trip" 
								className="rounded-lg shadow h-60 sm:h-48 w-full object-cover"
							/>

							{isEditing && (
								<button
									type="button"
									onClick={() => removeImage(idx)}
									className="absolute top-2 right-2 bg-red-500 bg-opacity-75 text-white rounded-full px-2 py-1.5 text-xs hover:bg-opacity-100"
								>
									✕
								</button>
							)}
						</div>
					))}
				</div>

				{isEditing && (
					<div className="mt-4">
						<label
							htmlFor="file-upload"
							className={`h-52 mt-1 flex justify-center items-center px-6 border-2  border-gray-300 border-dashed rounded-lg cursor-pointer text-bluegray-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-salmon-primary transition-colors
								${isDragging ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<div className="space-y-1 text-center">
								<svg
									className="mx-auto h-16 w-16 text-gray-400"
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
								<p className="text-gray-400">(PNG, JPG, GIF up to 10MB)</p>
							</div>
						</label>
					</div>
				)}
			</div>

			{/* Delete Modal */}
			{showDelete && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="rounded-3xl p-10 max-w-md w-full bg-black bg-opacity-50 mt-40">
						<div className="bg-gray-50 rounded-3xl p-8 w-full">
							<h4 className="text-2xl font-bold text-center text-gray-800">
								Are your sure you want want to delete this trip?
							</h4>
							<p className="text-center text-gray-600 font-semibold my-6">
								This action cannot be undone.
							</p>
							<div className="flex justify-center mt-8 space-x-4">
							<button
								onClick={() => setShowDelete(false)}
								className="px-8 py-2 rounded-full font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								className="px-6 py-2 rounded-full bg-salmon-primary text-white hover:opacity-90 font-semibold"
							>
								Confirm Delete
							</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TripDetailPage;
