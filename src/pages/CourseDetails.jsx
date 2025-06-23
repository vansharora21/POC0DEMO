import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import axios from "axios";
import {ADMIN_GET_CATEGORY,ADMIN_GET_COURSES,ADD_ACTIVITIYS} from "../constants"; 

const CourseDetails = () => {
  const [showForm, setShowForm] = useState(false);
  const [courseDetails, setCourseDetails] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    courseName: "",
    courseId: "",
    duration: "",
    noOfModules: "",
    activities: "",
    notes1: "",
    notes2: "",
    notes3: "",
    notes4: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDetail, setExpandedDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tempCourseDetails, setTempCourseDetails] = useState([]);

  console.log("courseId is here", formData.courseId)
  const API = import.meta.env.VITE_BASE_URL_API;

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}${ADMIN_GET_CATEGORY}`);
        console.log("Fetched Categories:", res.data.data);
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
        const response = await axios.get(`${API}${ADMIN_GET_COURSES}`);
        console.log("Fetched Courses:", response.data.data.coursesList);
        setCourseData(response.data.data.coursesList);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Updated: Fetch Course Details by CourseId
  const fetchCourseDetailsByCourseId = async (courseId) => {
    try {
      const response = await axios.get(`${API}/admin/get/courses?courseName=${courseId}`);
      console.log("Course Details API Response:", response.data);
      
      if (response.data && response.data.data && response.data.data.coursesList) {
        return response.data.data.coursesList[0]; // Return the first course details
      }
      return null;
    } catch (error) {
      console.error("Error fetching course details:", error);
      throw error;
    }
  };

  // Fetch All Course Details
  useEffect(() => {
    const fetchAllCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}${ADD_ACTIVITIYS}`);
        console.log("All Course Details API Response:", response.data);
        
        if (response.data && response.data.data) {
          // For each course detail, fetch the complete course information
          const detailedCourseData = await Promise.all(
            response.data.data.map(async (courseDetail) => {
              try {
                const fullCourseData = await fetchCourseDetailsByCourseId(courseDetail.courseId);
                return {
                  ...courseDetail,
                  fullCourseData: fullCourseData
                };
              } catch (error) {
                console.error(`Error fetching details for course ${courseDetail.courseId}:`, error);
                return courseDetail;
              }
            })
          );
          
          setCourseDetails(detailedCourseData);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCourseDetails();
  }, []);

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
      ...(name === 'categoryName' && { courseName: '', courseId: '' }),
      ...(name === 'courseName' && { 
        courseId: courseData.find(course => course.courseName === value)?.courseId || ''
      })
    }));
  };

  const handleAddCourseToList = (e) => {
    e.preventDefault();
    
    if (!formData.categoryName || !formData.courseName || !formData.duration || !formData.noOfModules || !formData.activities) {
      alert("Please fill in all required fields");
      return;
    }

    const newCourseDetail = {
      courseId: formData.courseId,
      categoryName: formData.categoryName,
      courseName: formData.courseName,
      moreAboutCourse: {
        duration: formData.duration,
        noOfModules: parseInt(formData.noOfModules),
        Activities: parseInt(formData.activities)
      },
      notes: {
        notes1: formData.notes1 || "",
        notes2: formData.notes2 || "",
        notes3: formData.notes3 || "",
        notes4: formData.notes4 || ""
      }
    };

    setTempCourseDetails(prev => [...prev, newCourseDetail]);
    setFormData(prev => ({ 
      ...prev, 
      courseName: "", 
      courseId: "", 
      duration: "", 
      noOfModules: "", 
      activities: "",
      notes1: "",
      notes2: "",
      notes3: "",
      notes4: ""
    }));
    alert("Course details added to list! Add more courses or submit all course details.");
  };

  const handleSubmitAllCourseDetails = async () => {
    if (tempCourseDetails.length === 0) {
      alert("Please add at least one course detail");
      return;
    }

    setSubmitting(true);

    try {
      const promises = tempCourseDetails.map(courseDetail => 
        axios.post(`${API}admin/add/activities`, courseDetail, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      const responses = await Promise.all(promises);
      console.log("All Course Details Add Responses:", responses);

      // Refresh data from API after adding all
      // const refreshResponse = await axios.get(`${API}${ADD_ACTIVITIYS}`);
      // if (refreshResponse.data && refreshResponse.data.data) {
      //   setCourseDetails(refreshResponse.data.data);
      // }

      setTempCourseDetails([]);
      setFormData({ 
        categoryName: "", 
        courseName: "", 
        courseId: "", 
        duration: "", 
        noOfModules: "", 
        activities: "",
        notes1: "",
        notes2: "",
        notes3: "",
        notes4: ""
      });
      setShowForm(false);
      alert(`${tempCourseDetails.length} course details added successfully!`);

    } catch (error) {
      console.error("Error adding course details:", error);
      
      if (error.response) {
        alert(`Error: ${error.response.data?.message || 'Failed to save some course details'}`);
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const removeTempCourseDetail = (index) => {
    const updatedTempDetails = tempCourseDetails.filter((_, i) => i !== index);
    setTempCourseDetails(updatedTempDetails);
  };

  const handleEdit = (index) => {
    const detail = courseDetails[index];
    setFormData({
      categoryName: detail.categoryName || "",
      courseName: detail.courseName || "",
      courseId: detail.courseId || "",
      duration: detail.moreAboutCourse?.duration || "",
      noOfModules: detail.moreAboutCourse?.noOfModules?.toString() || "",
      activities: detail.moreAboutCourse?.Activities?.toString() || "",
      notes1: detail.notes?.notes1 || "",
      notes2: detail.notes?.notes2 || "",
      notes3: detail.notes?.notes3 || "",
      notes4: detail.notes?.notes4 || ""
    });
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course detail?");
    
    if (!confirmDelete) return;

    try {
      const detailId = courseDetails[index].id;
      
      const response = await axios.delete(`${API}${ADD_ACTIVITIYS}`, { 
        data: { id: detailId },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Course Details Delete Response:", response.data);

      const refreshResponse = await axios.get(`${API}${ADD_ACTIVITIYS}`);
      if (refreshResponse.data && refreshResponse.data.data) {
        setCourseDetails(refreshResponse.data.data);
      }
      
      alert("Course details deleted successfully!");

      if (editIndex === index) {
        setEditIndex(null);
        setFormData({ 
          categoryName: "", 
          courseName: "", 
          courseId: "", 
          duration: "", 
          noOfModules: "", 
          activities: "",
          notes1: "",
          notes2: "",
          notes3: "",
          notes4: ""
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error deleting course details:", error);
      
      if (error.response) {
        alert(`Error: ${error.response.data?.message || 'Failed to delete course details'}`);
      } else {
        alert("Failed to delete course details. Please try again.");
      }
    }
  };

  const filteredDetails = courseDetails.filter((detail) =>
    (detail.courseName && detail.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (detail.categoryName && detail.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (detail.moreAboutCourse?.duration && detail.moreAboutCourse.duration.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (detail.notes?.notes1 && detail.notes.notes1.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleDetail = (index) => {
    setExpandedDetail(expandedDetail === index ? null : index);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Course Details Management" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditIndex(null);
                setTempCourseDetails([]);
                setFormData({ 
                  categoryName: "", 
                  courseName: "", 
                  courseId: "", 
                  duration: "", 
                  noOfModules: "", 
                  activities: "",
                  notes1: "",
                  notes2: "",
                  notes3: "",
                  notes4: ""
                });
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              disabled={submitting}
            >
              <Plus className="w-4 h-4" />
              {editIndex !== null ? "Edit Course Details" : "Add Multiple Course Details"}
            </button>
          </div>
          
          {courseDetails.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search course details..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg">
            <p className="text-blue-400">Loading...</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="grid gap-4 mb-8 bg-gray-800 bg-opacity-60 backdrop-blur-md text-white rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">
              {editIndex !== null ? "Edit Course Details" : "Add Multiple Course Details"}
            </h3>
            
            <form onSubmit={handleAddCourseToList}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <select
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={submitting}
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
                  disabled={!formData.categoryName || submitting}
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
              </div>

              {/* More About Course Section */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 text-indigo-300">More About Course</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="duration"
                    placeholder="Duration (e.g., 9 Months)"
                    value={formData.duration}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={submitting}
                  />

                  <input
                    type="number"
                    name="noOfModules"
                    placeholder="Number of Modules"
                    value={formData.noOfModules}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                    disabled={submitting}
                  />

                  <input
                    type="number"
                    name="activities"
                    placeholder="Number of Activities"
                    value={formData.activities}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 text-green-300">Course Notes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="notes1"
                    placeholder="Note 1 (e.g., Live classes will be conducted weekly)"
                    value={formData.notes1}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />

                  <input
                    type="text"
                    name="notes2"
                    placeholder="Note 2 (e.g., Includes practical assignments)"
                    value={formData.notes2}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />

                  <input
                    type="text"
                    name="notes3"
                    placeholder="Note 3 (e.g., Access to recorded sessions)"
                    value={formData.notes3}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />

                  <input
                    type="text"
                    name="notes4"
                    placeholder="Note 4 (e.g., Certification after completion)"
                    value={formData.notes4}
                    onChange={handleChange}
                    className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  Add Course to List
                </button>
                
                {tempCourseDetails.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmitAllCourseDetails}
                    className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      `Submit All Course Details (${tempCourseDetails.length})`
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditIndex(null);
                    setTempCourseDetails([]);
                    setFormData({ 
                      categoryName: "", 
                      courseName: "", 
                      courseId: "", 
                      duration: "", 
                      noOfModules: "", 
                      activities: "",
                      notes1: "",
                      notes2: "",
                      notes3: "",
                      notes4: ""
                    });
                  }}
                  className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Temporary Course Details List */}
            {tempCourseDetails.length > 0 && (
              <div className="mt-6 p-4 bg-gray-700 rounded-md">
                <h4 className="text-md font-medium mb-3">Course Details to be submitted ({tempCourseDetails.length}):</h4>
                <div className="space-y-3">
                  {tempCourseDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-600 rounded">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                            {detail.categoryName}
                          </span>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            {detail.courseName}
                          </span>
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            {detail.moreAboutCourse.duration}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div>Modules: {detail.moreAboutCourse.noOfModules} | Activities: {detail.moreAboutCourse.Activities}</div>
                          {detail.notes.notes1 && <div className="mt-1">• {detail.notes.notes1}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeTempCourseDetail(index)}
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

        {/* Course Details List */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Course Details List ({courseDetails.length} total)
          </h2>
          
          {filteredDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No course details found. Add your first course details to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDetails.map((detail, index) => (
                <motion.div
                  key={detail.id || index}
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
                            {detail.categoryName || 'No Category'}
                          </span>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            {detail.courseName || 'No Course'}
                          </span>
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                            {detail.moreAboutCourse?.duration}
                          </span>
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            {detail.moreAboutCourse?.noOfModules} Modules
                          </span>
                          <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">
                            {detail.moreAboutCourse?.Activities} Activities
                          </span>
                        </div>
                        <button
                          onClick={() => toggleDetail(index)}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-white font-medium text-lg pr-4">
                            {detail.courseName} - Course Details
                          </h3>
                          {expandedDetail === index ? (
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
                    
                    {expandedDetail === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-600"
                      >
                        <div className="text-gray-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2 text-indigo-300">Course Information:</h4>
                              <div className="space-y-1 text-sm">
                                <div><span className="font-medium">Duration:</span> {detail.moreAboutCourse?.duration}</div>
                                <div><span className="font-medium">Modules:</span> {detail.moreAboutCourse?.noOfModules}</div>
                                <div><span className="font-medium">Activities:</span> {detail.moreAboutCourse?.Activities}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-green-300">Course Notes:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {detail.notes?.notes1 && <li>{detail.notes.notes1}</li>}
                                {detail.notes?.notes2 && <li>{detail.notes.notes2}</li>}
                                {detail.notes?.notes3 && <li>{detail.notes.notes3}</li>}
                                {detail.notes?.notes4 && <li>{detail.notes.notes4}</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CourseDetails;
