import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_BASE_URL_API;

const EmailTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brochureData, setBrochureData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const getBrochureEmail = async () => {
    try {
      const response = await axios.get(`${API}user/brochure/requests`);
      setBrochureData(response.data.data || []); 
      setLoading(false);
    } catch (err) {
      console.error("Error fetching brochure data:", err);
      setError("Error fetching brochure data.");
      setLoading(false);
    }
  };

  console.log(brochureData);

  useEffect(() => {
    getBrochureEmail();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this email entry?")) {
      try {
        const response = await axios.delete(`${API}user/brochure/requests/${id}`);
        if (response.status === 200) {
          const updatedData = brochureData.filter((email) => email.id !== id);
          setBrochureData(updatedData);
          
          // Adjust current page if necessary
          const totalPages = Math.ceil(updatedData.length / itemsPerPage);
          if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
          }
        }
      } catch (err) {
        console.error("Error deleting email entry:", err);
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading emails...</p>
        </div>
      </motion.div>
    );
  }

  if (error && brochureData.length === 0) {
    return (
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-400 text-center">
          <p className="mb-4">Error loading emails: {error}</p>
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

  // Filtered email list based on search term
  const filteredEmails = brochureData.filter(
    (email) =>
      email.email.toLowerCase().includes(searchTerm) ||
      (email.Course && email.Course.toLowerCase().includes(searchTerm)) ||
      (email.categoryName && email.categoryName.toLowerCase().includes(searchTerm)) ||
      (email.courseName && email.courseName.toLowerCase().includes(searchTerm))
  );

  // Pagination calculations
  const totalItems = filteredEmails.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmails.slice(indexOfFirstItem, indexOfLastItem);

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

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Brochure Emails ({totalItems})</h2>
          {totalItems > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} email requests
            </p>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search email or course..."
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {filteredEmails.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No email requests found matching your search.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course Inquired</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Request Date</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.map((brotureEmail) => (
                  <motion.tr
                    key={brotureEmail.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-700"
                    layout
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {brotureEmail.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm text-gray-300">{brotureEmail.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{brotureEmail.categoryName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                        {brotureEmail.courseName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{brotureEmail.date?.slice(0, 10)}</div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(brotureEmail.id)}
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

export default EmailTable;
