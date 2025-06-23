import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Trash, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { USER_CONTACT_USER } from "../../constants";

const QueriesTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [userData, setUserData] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [expandedId, setExpandedId] = useState(null);
	
	// Pagination states
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(20);

	const API = import.meta.env.VITE_BASE_URL_API;

	console.log("here is the user data ", userData);

	useEffect(() => {
		const fetchQueriesData = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`${API}${USER_CONTACT_USER}`);
				console.log("Full API Response:", response.data);
				
				const queriesData = response.data.data.contacts;
				console.log("Queries Data:", queriesData);
				
				queriesData.forEach((user, index) => {
					console.log(`User ${index}:`, user);
					console.log(`User ${index} description:`, user.description);
				});
				
				setUserData(queriesData);
				setFilteredUsers(queriesData);
				setLoading(false);
			} catch (err) {
				console.error("Failed to fetch user data:", err.message);
				setError(err.message);
				setLoading(false);
			}
		};

		fetchQueriesData();
	}, [API]);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		setCurrentPage(1); // Reset to first page when searching

		if (term === "") {
			setFilteredUsers(userData);
			return;
		}

		const filtered = userData.filter((user) =>
			`${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
			user.email.toLowerCase().includes(term) ||
			user.phone?.toLowerCase().includes(term) ||
			user.mobile?.toLowerCase().includes(term) ||
			(user.description && user.description.toLowerCase().includes(term)) ||
			(user.message && user.message.toLowerCase().includes(term))
		);
		setFilteredUsers(filtered);
	};

	const toggleExpand = (id) => {
		console.log("Toggling expand for ID:", id);
		setExpandedId(prev => (prev === id ? null : id));
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this query?")) {
			try {
				await axios.delete(`${API}user/contact/users/${id}`);
				const updatedData = userData.filter((user) => user.id !== id);
				setUserData(updatedData);
				setFilteredUsers(updatedData);
				
				// Adjust current page if necessary
				const totalPages = Math.ceil(updatedData.length / itemsPerPage);
				if (currentPage > totalPages && totalPages > 0) {
					setCurrentPage(totalPages);
				}
			} catch (err) {
				console.error("Failed to delete query:", err.message);
				alert(`Failed to delete: ${err.message}`);
			}
		}
	};

	// Pagination calculations
	const totalItems = filteredUsers.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

	// Pagination handlers
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
		setExpandedId(null); // Close any expanded rows when changing pages
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			handlePageChange(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			handlePageChange(currentPage + 1);
		}
	};

	// Generate page numbers for pagination
	const getPageNumbers = () => {
		const pageNumbers = [];
		const maxVisiblePages = 5;
		
		if (totalPages <= maxVisiblePages) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			const halfVisible = Math.floor(maxVisiblePages / 2);
			let startPage = Math.max(1, currentPage - halfVisible);
			let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
			
			if (endPage - startPage < maxVisiblePages - 1) {
				startPage = Math.max(1, endPage - maxVisiblePages + 1);
			}
			
			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(i);
			}
		}
		
		return pageNumbers;
	};

	if (loading) {
		return (
			<motion.div className="text-white text-center p-6">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
				<p>Loading queries...</p>
			</motion.div>
		);
	}

	if (error && filteredUsers.length === 0) {
		return (
			<motion.div className="text-red-400 text-center p-6">
				<p className="mb-4">Error loading queries: {error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
				>
					Try Again
				</button>
			</motion.div>
		);
	}

	return (
		<motion.div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-100">Queries ({totalItems})</h2>
					{totalItems > 0 && (
						<p className="text-sm text-gray-400 mt-1">
							Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} queries
						</p>
					)}
				</div>
				<div className="relative">
					<input
						type="text"
						placeholder="Search queries..."
						className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
				</div>
			</div>

			{filteredUsers.length === 0 ? (
				<div className="text-center text-gray-400 py-8">No queries found matching your search.</div>
			) : (
				<>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-700">
							<thead>
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Details</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-700">
								{currentItems.map((user, index) => {
									const uniqueId = user.id || user._id || `user-${indexOfFirstItem + index}`;
									
									return (
										<React.Fragment key={uniqueId}>
											<tr className="hover:bg-gray-700">
												<td className="px-6 py-4">
													<div className="flex items-center">
														<div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
															{user.firstName?.charAt(0) || user.name?.charAt(0) || 'U'}
														</div>
														<div className="ml-4 text-sm text-white overflow-hidden whitespace-nowrap overflow-ellipsis" title={`${user.firstName} ${user.lastName}`}>
															{user.firstName} {user.lastName} {user.name && !user.firstName && user.name}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
												<td className="px-6 py-4 text-sm text-gray-300">{user.mobile || user.phone}</td>
												<td className="px-6 py-4">
													<button
														onClick={() => {
															console.log("Clicked user:", user);
															console.log("User description:", user.description);
															console.log("User message:", user.message);
															toggleExpand(uniqueId);
														}}
														className="flex items-center text-blue-400 hover:text-blue-300"
													>
														View Details{" "}
														{expandedId === uniqueId ? (
															<ChevronUp size={16} className="ml-1" />
														) : (
															<ChevronDown size={16} className="ml-1" />
														)}
													</button>
												</td>
											</tr>

											<AnimatePresence>
												{expandedId === uniqueId && (
													<motion.tr
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														exit={{ opacity: 0, height: 0 }}
														className="bg-gray-900"
													>
														<td colSpan={4} className="px-6 py-4">
															<div className="bg-gray-800 p-4 rounded-md">
																<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																	<div>
																		<h4 className="text-sm font-medium text-gray-300 mb-2">
																			Contact Information:
																		</h4>
																		<div className="space-y-1 text-sm text-gray-400">
																			<p><span className="font-medium">Name:</span> {user.firstName} {user.lastName} {user.name && !user.firstName && user.name}</p>
																			<p><span className="font-medium">Email:</span> {user.email}</p>
																			<p><span className="font-medium">Phone:</span> {user.mobile || user.phone || 'Not provided'}</p>
																			{user.createdAt && (
																				<p><span className="font-medium">Submitted:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
																			)}
																		</div>
																	</div>
																	<div>
																		<h4 className="text-sm font-medium text-gray-300 mb-2">
																			Query Description:
																		</h4>
																		<div className="text-sm text-gray-400 leading-relaxed max-h-32 overflow-y-auto">
																			{user.description || user.message || user.query || "No description provided."}
																		</div>
																	</div>
																</div>
															</div>
														</td>
													</motion.tr>
												)}
											</AnimatePresence>
										</React.Fragment>
									);
								})}
							</tbody>
						</table>
					</div>

					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="mt-6 flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<button
									onClick={handlePreviousPage}
									disabled={currentPage === 1}
									className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<ChevronLeft size={16} className="mr-1" />
									Previous
								</button>
								
								<div className="flex items-center space-x-1">
									{getPageNumbers().map((pageNumber) => (
										<button
											key={pageNumber}
											onClick={() => handlePageChange(pageNumber)}
											className={`px-3 py-2 text-sm font-medium rounded-md ${
												currentPage === pageNumber
													? 'bg-blue-600 text-white'
													: 'text-gray-300 bg-gray-700 hover:bg-gray-600'
											}`}
										>
											{pageNumber}
										</button>
									))}
								</div>
								
								<button
									onClick={handleNextPage}
									disabled={currentPage === totalPages}
									className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
									<ChevronRight size={16} className="ml-1" />
								</button>
							</div>
							
							<div className="text-sm text-gray-400">
								Page {currentPage} of {totalPages}
							</div>
						</div>
					)}
				</>
			)}
		</motion.div>
	);
};

export default QueriesTable;
