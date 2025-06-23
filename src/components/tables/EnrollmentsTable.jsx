import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react";

const EnrollmentsTable = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [enrollments, setEnrollments] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(20);

	const API = import.meta.env.VITE_BASE_URL_API;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`${API}user/get/enroll`);
				const enrollData = res.data.enrollUser;
				setEnrollments(enrollData);
				setFilteredUsers(enrollData);
				setLoading(false);
			} catch (err) {
				setError(err.message || 'Failed to fetch data');
				setLoading(false);
			}
		};
		fetchData();
	}, [API]);

	const handleSearch = (e) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);
		setCurrentPage(1); // Reset to first page when searching
		
		if (!term) {
			setFilteredUsers(enrollments);
			return;
		}
		const filtered = enrollments.filter(
			(user) =>
				user.name?.toLowerCase().includes(term) ||
				user.email?.toLowerCase().includes(term) ||
				user.mobile?.toLowerCase().includes(term) ||
				user.courseName?.toLowerCase().includes(term)
		);
		setFilteredUsers(filtered);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this enrollment?")) {
			try {
				await axios.delete(`${API}enrollments/${id}`);
				const updatedList = enrollments.filter(user => user._id !== id);
				setEnrollments(updatedList);
				setFilteredUsers(updatedList);
				
				// Adjust current page if necessary
				const totalPages = Math.ceil(updatedList.length / itemsPerPage);
				if (currentPage > totalPages && totalPages > 0) {
					setCurrentPage(totalPages);
				}
			} catch (err) {
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
			<motion.div 
				className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 flex justify-center items-center' 
				initial={{ opacity: 0 }} 
				animate={{ opacity: 1 }}
			>
				<div className="text-white text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
					<p>Loading enrollments...</p>
				</div>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div 
				className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700' 
				initial={{ opacity: 0 }} 
				animate={{ opacity: 1 }}
			>
				<div className="text-red-400 text-center">
					<p className="mb-4">Error loading enrollments: {error}</p>
					<button 
						onClick={() => window.location.reload()} 
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div 
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700' 
			initial={{ opacity: 0, y: 20 }} 
			animate={{ opacity: 1, y: 0 }} 
			transition={{ delay: 0.2 }}
		>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h2 className='text-xl font-semibold text-gray-100'>Enrollments ({totalItems})</h2>
					{totalItems > 0 && (
						<p className="text-sm text-gray-400 mt-1">
							Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} enrollments
						</p>
					)}
				</div>
				<div className='relative'>
					<input
						type='text'
						placeholder='Search users...'
						className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={searchTerm}
						onChange={handleSearch}
					/>
					<Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
				</div>
			</div>

			{filteredUsers.length === 0 ? (
				<div className="text-center text-gray-400 py-8">No enrollments found matching your search.</div>
			) : (
				<>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-gray-700'>
							<thead>
								<tr>
									{["Name", "Email", "Phone Number", "Course"].map((header) => (
										<th key={header} className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-700'>
								{currentItems.map((user) => (
									<motion.tr 
										key={user._id} 
										initial={{ opacity: 0 }} 
										animate={{ opacity: 1 }} 
										transition={{ duration: 0.3 }} 
										className="hover:bg-gray-700 cursor-pointer"
									>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
													{user.name?.charAt(0)}
												</div>
												<div className='ml-4'>
													<div className='text-sm font-medium text-gray-100'>{user.name}</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{user.email}</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>+91-{user.mobile || "Not provided"}</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm'>
											<span className='bg-blue-800 text-blue-100 px-2 py-1 rounded text-xs'>{user.courseName || "N/A"}</span>
										</td>
										{/* <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
											<button 
												className='text-indigo-400 hover:text-indigo-300 mr-3' 
												onClick={() => window.location.href = `/edit-enrollment/${user._id}`}
											>
												<Pencil size={18} />
											</button>
											<button 
												className='text-red-400 hover:text-red-300' 
												onClick={() => handleDelete(user._id)}
											>
												<Trash size={18} />
											</button>
										</td> */}
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Enhanced Pagination Controls */}
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

export default EnrollmentsTable;
