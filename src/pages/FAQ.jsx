import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import axios from "axios";

const FAQPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    courseName: "",
    courseId: "",
    question: "",
    answer: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [tempFAQs, setTempFAQs] = useState([]);

  const API = import.meta.env.VITE_BASE_URL_API;

  // Load FAQs from localStorage on component mount
  useEffect(() => {
    const savedFAQs = localStorage.getItem('faqs');
    if (savedFAQs) {
      try {
        const parsedFAQs = JSON.parse(savedFAQs);
        setFaqs(parsedFAQs);
        console.log("Loaded FAQs from localStorage:", parsedFAQs);
      } catch (error) {
        console.error("Error parsing localStorage FAQs:", error);
      }
    }
  }, []);

  // Save FAQs to localStorage whenever faqs state changes
  useEffect(() => {
    if (faqs.length > 0) {
      localStorage.setItem('faqs', JSON.stringify(faqs));
      console.log("Saved FAQs to localStorage:", faqs);
    }
  }, [faqs]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}admin/get/category`);
        setCategoryData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}admin/get/courses`);
        setCourseData(response.data.data.coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch FAQs - FIXED VERSION
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get(`${API}faq/get`);
        console.log("FAQ API Response:", response.data);
        
        if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // Only set from API if we get actual data
          setFaqs(response.data.data);
          console.log("Set FAQs from API:", response.data.data);
        } else {
          console.log("No FAQ data from API, keeping localStorage data");
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        // Keep localStorage data if API fails
      }
    };
    fetchFAQs();
  }, []);

  // Filter courses based on selected category
  useEffect(() => {
    if (formData.categoryName) {
      const filtered = courseData.filter(course => 
        course.categoryName === formData.categoryName
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [formData.categoryName, courseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      // Reset course when category changes
      ...(name === 'categoryName' && { courseName: '', courseId: '' }),
      // Set courseId when course is selected
      ...(name === 'courseName' && { 
        courseId: courseData.find(course => course.courseName === value)?.courseId || ''
      })
    }));
  };

  const handleAddFAQToList = (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      alert("Please fill in question and answer");
      return;
    }

    const newFAQ = {
      question: formData.question,
      answer: formData.answer
    };

    setTempFAQs(prev => [...prev, newFAQ]);
    setFormData(prev => ({ ...prev, question: "", answer: "" }));
    alert("FAQ added to list! Add more or submit all FAQs.");
  };

  const handleSubmitAllFAQs = async () => {
    if (!formData.courseId || tempFAQs.length === 0) {
      alert("Please select a course and add at least one FAQ");
      return;
    }

    try {
      const faqData = {
        courseId: formData.courseId,
        faq: tempFAQs
      };

      console.log("Sending FAQ data:", faqData);

      const response = await axios.post(`${API}faq/add`, faqData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("FAQ Add Response:", response.data);

      // Add to local state for immediate display
      const newFAQsWithMeta = tempFAQs.map((faq, index) => ({
        id: Date.now() + index,
        ...faq,
        categoryName: formData.categoryName,
        courseName: formData.courseName,
        courseId: formData.courseId,
        createdAt: new Date().toISOString()
      }));

      setFaqs(prev => [...prev, ...newFAQsWithMeta]);
      setTempFAQs([]);
      setFormData({ categoryName: "", courseName: "", courseId: "", question: "", answer: "" });
      setShowForm(false);
      alert(`${tempFAQs.length} FAQs added successfully!`);

    } catch (error) {
      console.error("Error adding FAQs:", error);
      
      // Even if API fails, save locally for persistence
      const newFAQsWithMeta = tempFAQs.map((faq, index) => ({
        id: Date.now() + index,
        ...faq,
        categoryName: formData.categoryName,
        courseName: formData.courseName,
        courseId: formData.courseId,
        createdAt: new Date().toISOString()
      }));

      setFaqs(prev => [...prev, ...newFAQsWithMeta]);
      setTempFAQs([]);
      setFormData({ categoryName: "", courseName: "", courseId: "", question: "", answer: "" });
      setShowForm(false);
      alert(`${tempFAQs.length} FAQs saved locally!`);
    }
  };

  const handleEdit = (index) => {
    const faq = faqs[index];
    setFormData({
      categoryName: faq.categoryName || "",
      courseName: faq.courseName || "",
      courseId: faq.courseId || "",
      question: faq.question || "",
      answer: faq.answer || ""
    });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this FAQ?");
    
    if (!confirmDelete) return;

    try {
      const faqId = faqs[index].id;
      // API call to delete FAQ (uncomment when ready)
      // await axios.delete(`${API}faq/delete`, { data: { faqId } });

      const updatedFAQs = faqs.filter((_, i) => i !== index);
      setFaqs(updatedFAQs);
      
      // Update localStorage
      localStorage.setItem('faqs', JSON.stringify(updatedFAQs));
      
      alert("FAQ deleted successfully!");

      if (editIndex === index) {
        setEditIndex(null);
        setFormData({ categoryName: "", courseName: "", courseId: "", question: "", answer: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ. Please try again.");
    }
  };

  const removeTempFAQ = (index) => {
    const updatedTempFAQs = tempFAQs.filter((_, i) => i !== index);
    setTempFAQs(updatedTempFAQs);
  };

  const filteredFAQs = faqs.filter((faq) =>
    (faq.question && faq.question.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (faq.categoryName && faq.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (faq.courseName && faq.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Clear all FAQs function (for testing)
  const clearAllFAQs = () => {
    const confirmClear = window.confirm("Are you sure you want to clear all FAQs?");
    if (confirmClear) {
      setFaqs([]);
      localStorage.removeItem('faqs');
      alert("All FAQs cleared!");
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="FAQ Management" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditIndex(null);
                setTempFAQs([]);
                setFormData({ categoryName: "", courseName: "", courseId: "", question: "", answer: "" });
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              {editIndex !== null ? "Edit FAQ" : "Add FAQs"}
            </button>
            
            {/* Clear All Button for testing */}
            {faqs.length > 0 && (
              <button
                onClick={clearAllFAQs}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-sm"
              >
                Clear All ({faqs.length})
              </button>
            )}
          </div>
          
          {faqs.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQs..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {/* Rest of your JSX remains the same... */}
        {showForm && (
          <div className="grid gap-4 mb-8 bg-gray-800 bg-opacity-60 backdrop-blur-md text-white rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">
              {editIndex !== null ? "Edit FAQ" : "Add FAQs for Course"}
            </h3>
            
            {/* Category Selection */}
            <select
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>Select Category</option>
              {categoryData.map((cat, index) => (
                <option key={index} value={cat.categoryName}>
                  {cat.categoryName}
                </option>
              ))}
            </select>

            {/* Course Selection */}
            <select
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={!formData.categoryName}
            >
              <option value="" disabled>
                {formData.categoryName ? "Select Course" : "Select Category First"}
              </option>
              {filteredCourses.map((course, index) => (
                <option key={index} value={course.courseName}>
                  {course.courseName}
                </option>
              ))}
            </select>

            {/* FAQ Question */}
            <textarea
              name="question"
              placeholder="FAQ Question"
              value={formData.question}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              required
            />

            {/* FAQ Answer */}
            <textarea
              name="answer"
              placeholder="FAQ Answer"
              value={formData.answer}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              required
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddFAQToList}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Add FAQ to List
              </button>
              
              {tempFAQs.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitAllFAQs}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Submit All FAQs ({tempFAQs.length})
                </button>
              )}
            </div>

            {/* Temporary FAQ List */}
            {tempFAQs.length > 0 && (
              <div className="mt-4 p-4 bg-gray-700 rounded-md">
                <h4 className="text-md font-medium mb-3">FAQs to be submitted:</h4>
                <div className="space-y-2">
                  {tempFAQs.map((faq, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-600 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{faq.question}</p>
                        <p className="text-gray-300 text-xs mt-1">{faq.answer}</p>
                      </div>
                      <button
                        onClick={() => removeTempFAQ(index)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQ List */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            FAQ List ({faqs.length} total)
          </h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No FAQs found. Add your first FAQ to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id || index}
                  className="bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                            {faq.categoryName || 'No Category'}
                          </span>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            {faq.courseName || 'No Course'}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFAQ(index)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-white font-medium text-lg pr-4">
                            {faq.question}
                          </h3>
                          {expandedFAQ === index ? (
                            <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-600"
                      >
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* FAQ Table View (Alternative) */}
        <motion.div
          className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">FAQ Management Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Answer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredFAQs.map((faq, index) => (
                  <motion.tr
                    key={faq.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {faq.categoryName || 'No Category'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {faq.courseName || 'No Course'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-100 font-medium max-w-xs">
                      <div className="truncate" title={faq.question}>
                        {faq.question}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                      <div className="truncate" title={faq.answer}>
                        {faq.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <button
                        onClick={() => handleEdit(index)}
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FAQPage;
