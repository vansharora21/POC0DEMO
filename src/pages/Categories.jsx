import { useState } from "react";
import { Upload, FileCheck, X, Eye, Download, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/common/Header";
import axios from "axios";
import * as XLSX from "xlsx";

const OverviewPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const API = import.meta.env.VITE_BASE_URL_API;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    console.log("hello", file)
    processFile(file);
  };

  const processFile = (file) => {
    console.log("file is here", file)
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid Excel file (.xlsx or .xls)");
        return;
      }
      setSelectedFile(file);
      readExcelFile(file);
      console.log("Selected file name:", file.name);
    console.log("Selected file object:", file);
    console.log("selectedFile is here", selectedFile)
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const readExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bufferArray = e.target.result;
        const workbook = XLSX.read(bufferArray, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setExcelData(data);
        console.log("Excel data parsed:", data);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert("Error reading Excel file. Please check the file format.");
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      alert("Error reading file");
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = async () => {
  if (!selectedFile) {
    alert("Please select an Excel file first");
    return;
  }

  setUploadLoading(true);
  setUploadProgress(0);

  try {
    const fileName = selectedFile.name;
    const fileUrl = `${fileName}`;

    // Create FormData
    const formData = new FormData();
    formData.append("file", selectedFile); // 👈 URL string in FormData

    console.log("FormData payload: excelFile =", fileUrl);

    const response = await axios.post(`${API}admin/upload-excel`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setUploadProgress(100);
    console.log("Upload successful:", response.data);
    alert("Excel file URL sent successfully!");

    // Optional reset
    setTimeout(() => {
      setSelectedFile(null);
      setExcelData([]);
      setUploadProgress(0);
    }, 1500);
    
  } catch (error) {
    console.error("Error uploading form-data:", error);
    alert("Failed to send Excel file URL.");
    setUploadProgress(0);
  } finally {
    setUploadLoading(false);
  }
};


  const removeFile = () => {
    setSelectedFile(null);
    setExcelData([]);
    setShowPreview(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Excel File Manager" />
      <main className="max-w-6xl mx-auto py-8 px-4">
        <motion.div
          className="bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-200 text-gray-900 rounded-3xl p-8 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Upload Excel File
                </h2>
                <p className="text-gray-600 text-sm">Drag and drop or browse to upload</p>
              </div>
            </div>
            {selectedFile && (
              <motion.button
                onClick={removeFile}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-red-500" />
              </motion.button>
            )}
          </div>

          {/* Upload Area */}
          <motion.div
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="text-center">
              <motion.div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  selectedFile ? 'bg-green-100' : 'bg-gray-200'
                }`}
                animate={{ 
                  scale: isDragOver ? 1.1 : 1,
                  backgroundColor: selectedFile ? 'rgba(220, 252, 231, 1)' : 'rgba(229, 231, 235, 1)'
                }}
              >
                {selectedFile ? (
                  <FileCheck className="w-8 h-8 text-green-600" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-500" />
                )}
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {selectedFile ? 'File Selected' : 'Drop your Excel file here'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedFile ? selectedFile.name : 'or click to browse'}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Supported formats: .xlsx, .xls</span>
              </div>
            </div>
          </motion.div>

          {/* File Info */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div
                className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-600">File Information</h4>
                  {excelData.length > 0 && (
                    <motion.button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </motion.button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">File Name</p>
                    <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-medium text-gray-900">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Rows Detected</p>
                    <p className="font-medium text-green-600">{excelData.length}</p>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadLoading && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex justify-between text-sm mb-2 text-gray-700">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data Preview */}
          <AnimatePresence>
            {showPreview && excelData.length > 0 && (
              <motion.div
                className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4 className="text-lg font-semibold mb-4 text-purple-600">Data Preview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300 bg-gray-50">
                        {Object.keys(excelData[0] || {}).map((key) => (
                          <th key={key} className="p-3 text-left text-gray-700 font-semibold">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 5).map((row, index) => (
                        <motion.tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="p-3 text-gray-800">
                              {String(value)}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.length > 5 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Showing 5 of {excelData.length} rows
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Button */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={handleExcelUpload}
              disabled={!selectedFile || uploadLoading}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: !selectedFile || uploadLoading ? 1 : 1.05 }}
              whileTap={{ scale: !selectedFile || uploadLoading ? 1 : 0.95 }}
            >
              <Upload className="w-5 h-5" />
              {uploadLoading ? 'Uploading...' : 'Upload Excel File'}
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default OverviewPage;
