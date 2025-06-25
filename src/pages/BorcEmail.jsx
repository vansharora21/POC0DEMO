import { FileSpreadsheet, Download, RefreshCw, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import { AutoSizer, Column, Table } from "react-virtualized";
import "react-virtualized/styles.css"; // important for styling
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ExcelDataView = () => {
  const navigate = useNavigate();
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    lastUpdated: null,
    fileSize: 0,
    fileName: ""
  });

  const API = import.meta.env.VITE_BASE_URL_API;

  // Fetch Excel data from API
  const fetchExcelData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("baseURl", API)
      // https://api.learnitfy.com/api/admin/get/gstData
      const response = await axios.get(`${API}admin/get/gstData`);
      console.log(response)

      if (response.data && response.data.data) {
        setExcelData(response.data.data);
        console.log("excelData", excelData)
        setStats({
          totalRecords: response.data.data.length,
          lastUpdated: response.data.lastUpdated || new Date().toISOString(),
          fileSize: response.data.fileSize || 0,
          fileName: response.data.fileName || "Unknown"
        });
      }
    } catch (error) {
      console.error("Error fetching Excel data:", error);
      setError("Failed to load Excel data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcelData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchExcelData();
  };

  // Export data (optional feature)
  const handleExport = () => {
    if (excelData.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8,"
      + Object.keys(excelData[0]).join(",") + "\n"
      + excelData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "excel_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='flex-1 overflow-auto relative z-10  min-h-screen' style={{}}>
      <Header title='Excel Data Preview' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden'
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
          >
            <div className='px-6 py-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <FileSpreadsheet className='w-6 h-6 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Total Records</p>
                  <p className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    {stats.totalRecords.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden'
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
          >
            <div className='px-6 py-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <Calendar className='w-6 h-6 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Last Updated</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden'
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
          >
            <div className='px-6 py-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <FileSpreadsheet className='w-6 h-6 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>File Size</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {(stats.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden'
            whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
          >
            <div className='px-6 py-6'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg'>
                    <FileSpreadsheet className='w-6 h-6 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>File Name</p>
                  <p className='text-lg font-semibold text-gray-900 truncate'>
                    {stats.fileName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          className='mb-6 flex justify-between items-center'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Excel Data Table
          </h2>

          <div className='flex gap-3'>
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
              onClick={handleExport}
              disabled={excelData.length === 0}
              className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              whileHover={{ scale: excelData.length === 0 ? 1 : 1.05 }}
              whileTap={{ scale: excelData.length === 0 ? 1 : 0.95 }}
            >
              <Download className='w-4 h-4' />
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {/* DATA TABLE */}
        <motion.div
          className='bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200 overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className='flex items-center justify-center py-16'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <RefreshCw className='w-8 h-8 animate-spin text-white' />
                </div>
                <span className='text-lg font-medium text-gray-700'>Loading Excel data...</span>
                <p className='text-gray-500 text-sm mt-2'>Please wait while we fetch your data</p>
              </div>
            </div>
          ) : error ? (
            <div className='text-center py-16'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FileSpreadsheet className='w-8 h-8 text-red-500' />
              </div>
              <p className='text-red-600 text-lg font-medium mb-4'>{error}</p>
              <motion.button
                onClick={handleRefresh}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          ) : excelData.length > 0 ? (
            <div className="w-full overflow-auto border rounded-2xl">
              <div style={{ width: Math.max(excelData[0] ? Object.keys(excelData[0]).length * 200 : 1000, '100%'), height: 500 }}>
                <AutoSizer disableWidth>
                  {({ height }) => {
                    const filteredKeys = Object.keys(excelData[0]).filter(
                      (key) => key !== "_id" && key !== "excelFile"
                    );

                    return (
                      <Table
                        width={filteredKeys.length * 120}
                        height={height}
                        headerHeight={40}
                        rowHeight={40}
                        rowCount={excelData.length}
                        rowGetter={({ index }) => excelData[index]}
                        rowClassName="border-b border-gray-100 hover:bg-blue-50 transition"
                        className="text-sm text-gray-800"
                      >
                        {filteredKeys.map((key) => (
                          <Column
                            key={key}
                            label={key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            dataKey={key}
                            width={200}
                            flexShrink={0}
                            headerClassName="bg-gray-100 font-semibold text-gray-700 text-xs px-2 whitespace-nowrap"
                            cellRenderer={({ cellData }) => (
                              <div className="text-xs px-2 whitespace-pre-wrap break-words">
                                {String(cellData)}
                              </div>
                            )}
                          />
                        ))}
                      </Table>
                    );
                  }}
                </AutoSizer>
              </div>
            </div>

          ) : (
            <div className='text-center py-16'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FileSpreadsheet className='w-10 h-10 text-gray-400' />
              </div>
              <p className='text-gray-700 text-xl font-semibold mb-2'>No Excel data found</p>
              <p className='text-gray-500 text-sm'>Upload an Excel file to see data here</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ExcelDataView;
