import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import axios from "axios";
import {
  ADMIN__CATEGORY,
  ADMIN__DELETE_CATEFGORY,
  ADMIN_GET_CATEGORY,
  UPDATE_CATEGORY,
} from "../constants";
import SpinnerLoader from "../components/Loader";

const OverviewPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    description: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BASE_URL_API;

  const addCategoryAPI = async () => {
    try {
      const data = new FormData();
      data.append("categoryName", formData.name);
      data.append("description", formData.description);
      data.append("logo", formData.image);

      const response = await axios.post(`${API}${ADMIN__CATEGORY}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Category added:", response.data);
      const res = await axios.get(`${API}${ADMIN_GET_CATEGORY}`);
      setCategoryData(res.data.data);
    } catch (error) {
      console.error("Error adding category:", error.message);
    }
  };

  useEffect(() => {
    const GetcategoryData = async () => {
      try {
        const response = await axios.get(`${API}${ADMIN_GET_CATEGORY}`);
        setCategoryData(response.data.data);
        console.log("here is the category data", response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    GetcategoryData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (PNG, JPEG, JPG).");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    if (editIndex !== null) {
      handleEdit(); 
    } else {
      addCategoryAPI();
    }
  };


  const handleEdit = async () => {
    try {
      const updatedData = {
        categoryId: editIndex,
        categoryName: formData.name,
        description: formData.description,
      };

      const response = await axios.patch(`${API}${UPDATE_CATEGORY}`,updatedData
      );

      console.log("Category updated:", response.data);

      // Refresh list
      const res = await axios.get(`${API}${ADMIN_GET_CATEGORY}`);
      setCategoryData(res.data.data);

      // Reset
      setFormData({ name: "", image: null, description: "" });
      setEditIndex(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };


  const handleDelete = async (categoryId) => {
    try {
      const deleteResponse = await axios.delete(
        `${API}${ADMIN__DELETE_CATEFGORY}`,
        {
          data: { categoryId },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const updatedcategoryData = categoryData.filter(
        (course) => course.categoryId !== categoryId
      );
      setCategoryData(updatedcategoryData);
      console.log("Remaining courses after deletion:", deleteResponse);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Add your Course Category here" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditIndex(null);
              setFormData({ name: "", image: null, description: "" });
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            {editIndex !== null ? "Edit Category" : "Add Category"}
          </button>

          {categories.length > 0 && (
            <div className="relative">
              <SpinnerLoader />

              <input
                type="text"
                placeholder="Search categories..."
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleAddCategory}
            className="grid gap-4 mb-8 bg-gray-800 bg-opacity-60 backdrop-blur-md text-white rounded-xl p-6 border border-gray-700"
          >
            <input
              type="text"
              name="name"
              placeholder="Category Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="file"
              name="image"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleChange}
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            />
            {formData.image && (
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
              className="bg-gray-700 border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />
            <button
              onClick={addCategoryAPI}
              type="submit"
              className="self-start px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {editIndex !== null ? "Update Category" : "Save Category"}
            </button>
          </form>
        )}

        {categoryData.length > 0 ? (
          <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <p className="text-center text-gray-400 mt-8">Loading...</p>
            ) : categoryData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {categoryData.map((cat, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4">
                          <img
                            src={cat.logo}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-100 font-semibold">
                          {cat.categoryName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {cat.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {cat.categoryId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <button
                            onClick={() => {
                              setShowForm(true);
                              setEditIndex(cat.categoryId);
                              setFormData({
                                name: cat.categoryName,
                                image: null,
                                description: cat.description,
                              });
                            }}
                            className="text-indigo-400 hover:text-indigo-300 mr-2"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(cat.categoryId)}
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
            ) : (
              <p className="text-center text-gray-400 mt-8">
                No categories found.
              </p>
            )}
          </motion.div>
        ) : (
          <p className="text-center text-gray-400 mt-8">No categories found.</p>
        )}
      </main>
    </div>
  );
};

export default OverviewPage;
