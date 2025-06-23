import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Flag } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import axios from "axios";
import { ADD_CONTENT, ADD_COURSES, ADMIN_GET_CATEGORY, ADMIN_GET_COURSES, DELETE_COURSES, UPDATE_COURSES, UPLOAD_PDF } from "../constants";

const CourseCategories = () => {
  const [showForm, setShowForm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    name: "",
    image: null,
    description: "",
    price: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleData, setModuleData] = useState({
    name: "",
    description: "",
    pdf: null
  });
  const [currentCourseIndex, setCurrentCourseIndex] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState([]);
  const [courseID, setCourseID] = useState("");
  const [sendPdf, setSentPdf] = useState(false);
  const [count, setCount] = useState(0);
  const [getCourseData, setGetCourseData] = useState([]);
  const [broturePdf, setBrochurePdf] = useState(null)
  const [showPdfForm, setShowPdfForm] = useState(false);

  console.log("hjdshjadsjhasd", getCourseData);

  const API = import.meta.env.VITE_BASE_URL_API;

  useEffect(() => {
    const responseGetCourse = async () => {
      const response = await axios.get(`${API}${ADMIN_GET_COURSES}`);
      const course_data = response.data.data.coursesList;
      setGetCourseData(course_data);
      // console.log("getCourseDatagetCourseDatagetCourseDatagetCourseDatav", getCourseData)
    };
    responseGetCourse();
  }, [])

  const handlebroturePDF = (e) => {
    setBrochurePdf(e.target.files[0])
  };

  const handleAddBrochurePdf = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pdf', broturePdf);
    formData.append('courseId', courseID); // Ensure course ID is included

    try {
      const response = await axios.post(`${API}${UPLOAD_PDF}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Brochure upload response:', response);
      setSentPdf(false);
      setShowModuleForm(false);
      setShowPdfForm(false); // Hide PDF form after sending
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const DeleteCourse = async (courseId) => {
    try {
      await axios.delete(`${API}${DELETE_COURSES}`, {
        data: { courseId },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
      const updatedCourseData = getCourseData.filter(course => course.courseId !== courseId);
      setGetCourseData(updatedCourseData);
      console.log("Course deleted successfully:", deleteResponse);
    } catch (error) {
      console.error("Error deleting course:", error.message);
    }
  };



  const AddCoursesAPI = async () => {
    const data = new FormData();
    data.append("categoryName", formData.categoryName)
    data.append("courseName", formData.name)
    data.append("description", formData.description)

    try {
      const response = await axios.post(`${API}${ADD_COURSES}`, data, {
        header: {
          'content-type': 'multipart/form-data'
        }
      });
      setCourseData(response.data.data);
      setCourseID(response.data.data.courseId);
    } catch (error) {
      console.error("Error adding course:", error.message);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}${ADMIN_GET_CATEGORY}`);
        setCategoryData(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file })); // Store the File object
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


const handleAddCourse = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.description || !formData.categoryName) return;

  const data = new FormData();
  data.append("categoryName", formData.categoryName);
  data.append("courseName", formData.name);
  data.append("description", formData.description);
  data.append("price", formData.price || "1000");

  if (formData.image) {
    data.append("image", formData.image);
  }

  try {
    if (editIndex !== null) {
      // Editing existing course
      data.append("courseId", courseID);

      const response = await axios.patch(`${API}${UPDATE_COURSES}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedCourse = response.data.data;
      const updatedCourses = [...getCourseData];
      updatedCourses[editIndex] = { ...updatedCourses[editIndex], ...updatedCourse };
      setGetCourseData(updatedCourses);
    } else {
      // Adding new course
      const response = await axios.post(`${API}${ADD_COURSES}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newCourse = response.data.data;
      setCourseData(newCourse);
      setCourseID(newCourse.courseId);
      setGetCourseData(prev => [...prev, newCourse]);
    }

    // Reset form
    setFormData({ categoryName: "", name: "", image: "", description: "", price: "" });
    setShowForm(false);
    setEditIndex(null);
    setSentPdf(true);

    if (editIndex === null) {
      setCourses(prev => [...prev, { ...formData, modules: [] }]);
      setCurrentCourseIndex(courses.length);
      setShowModuleForm(true);
    }

  } catch (error) {
    console.error("Error adding/updating course:", error.message);
    setError("Failed to save course");
  }
};

  const handleModuleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pdf" && files.length > 0) {
      setModuleData((prev) => ({ ...prev, pdf: files[0] }));
    } else {
      setModuleData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!moduleData.name || !moduleData.description || !moduleData.pdf) return;
    setModules((prev) => [...prev, moduleData]);
    setModuleData({ name: "", description: "", pdf: null });
  };

  const handleFinishModules = async () => {
    setCount(0);
    setSentPdf(true);
    setShowPdfForm(prev => !prev); 
  };

const handleEdit = (courseId) => {
  const course = getCourseData.find((c) => c.courseId === courseId);
  const index = getCourseData.findIndex((c) => c.courseId === courseId);
  if (!course) return;

  setFormData({
    categoryName: course.categoryName || "",
    name: course.courseName || "",
    image: null,
    description: course.description || "",
    price: course.price || "",
  });

  setEditIndex(index);
  setCourseID(course.courseId);
  setShowForm(true);
};

  const handleDelete = (index) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
    if (editIndex === index) {
      setEditIndex(null);
      setFormData({ categoryName: "", name: "", image: "", description: "", price: "" });
      setShowForm(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (courseID) {
      console.log("hi")
    }
  }, [courseID]);

  const hadleAddModule = async () => {
    try {
      const response = await axios.post(`${API}${ADD_CONTENT}`, {
        courseId: courseID,
        courseContent: [{
          moduleTitle: moduleData.name,
          description: moduleData.description
        }]
      });
      setModuleData({ name: "", description: "" });
      setCount(count + 1);
    } catch (error) {
      console.error("Error adding course:", error.message);
    }

  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Course Categories" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">

        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditIndex(null);
              setFormData({ categoryName: "", name: "", image: "", description: "", price: "" });
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            {editIndex !== null ? "Edit Course" : "Add Course"}
          </button>
          {courses.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleAddCourse}
            className="grid gap-4 mb-8 bg-gray-800 bg-opacity-60 backdrop-blur-md text-white rounded-xl p-6 border border-gray-700"
          >
            <select
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>Select course category</option>
              {categoryData.map((cat, index) => (
                <option key={index} value={cat.categoryName}>{cat.categoryName}</option>
              ))}
            </select>

            <input
              type="text"
              name="name"
              placeholder="Course Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md"
              required
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md text-white"
              required
            />
            {formData.image instanceof File && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md"
              rows="3"
              required
            />
            <button
              onClick={AddCoursesAPI}
              type="submit"
              className="self-start px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {editIndex !== null ? "Update Course" : "Save Course"}
            </button>
          </form>
        )}
        {showModuleForm && (
          <form
            onSubmit={handleAddModule}
            className="grid gap-4 mb-8 bg-gray-800 bg-opacity-60 backdrop-blur-md text-white rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">Add Modules for this Course</h3>
            <input
              type="text"
              name="name"
              placeholder="Module Name"
              value={moduleData.name}
              onChange={handleModuleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md"
              required
            />
            <textarea
              name="description"
              placeholder="Module Description"
              value={moduleData.description}
              onChange={handleModuleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md"
              rows="2"
              required
            />
            <button onClick={hadleAddModule} className="self-start px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">Add Module {count}</button>
            <button type="button" onClick={handleFinishModules} className="self-start px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mt-2">
              Finish & Save Course
            </button>
            {showPdfForm && (
              <form onSubmit={handleAddBrochurePdf} className="mt-4">
                <input
                  type="file"
                  name="pdf"
                  accept="application/pdf"
                  className="bg-gray-700 border px-4 py-2 rounded-md text-white"
                  onChange={handlebroturePDF}
                  required
                />
                <button
                  className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  type="submit"
                >
                  Send PDF
                </button>
              </form>
            )}
            <ul className="mt-2">
              {modules.map((mod, idx) => (
                <li key={idx} className="text-sm text-gray-300">{mod.name} - {mod.description} ({mod.pdf && mod.pdf.name})</li>
              ))}
            </ul>
          </form>
        )}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {getCourseData.map((course, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-gray-100 font-semibold">{course.name}</td> */}
                    <td className="px-6 py-4 text-sm text-gray-300">{course.categoryName}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{course.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{course.description}</td>
                    <h5>{course?.courseContent?.moduleTitle}</h5>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <button
                        onClick={() => handleEdit(course.courseId)}
                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                      >
                        <Edit size={18} />
                      </button> 

                      <button
                        onClick={() => DeleteCourse(course.courseId)}
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
    </div >
  );
};

export default CourseCategories;
