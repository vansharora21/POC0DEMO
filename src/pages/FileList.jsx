import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import { FileText, ExternalLink, Download } from 'lucide-react';

const FileList = () => {
  // Sample static data - replace with your actual data
  const files = [
    {
      name: 'Financial Report 2023.xlsx',
      size: '2.4 MB',
      lastModified: '2023-12-01',
      type: 'Excel'
    },
    {
      name: 'Customer Data.xlsx',
      size: '1.8 MB',
      lastModified: '2023-11-28',
      type: 'Excel'
    },
    {
      name: 'Sales Analysis.xlsx',
      size: '3.2 MB',
      lastModified: '2023-11-25',
      type: 'Excel'
    }
  ];

  return (
    <div className='flex-1 overflow-auto relative z-10 min-h-screen'>
      <Header title='File Library' />

      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Stats Section */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 p-6'
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
          >
            <h3 className='text-lg font-semibold text-gray-700'>Total Files</h3>
            <p className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              {files.length}
            </p>
          </motion.div>

          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 p-6'
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
          >
            <h3 className='text-lg font-semibold text-gray-700'>Total Size</h3>
            <p className='text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent'>
              7.4 MB
            </p>
          </motion.div>

          <motion.div
            className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 p-6'
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
          >
            <h3 className='text-lg font-semibold text-gray-700'>Last Updated</h3>
            <p className='text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
              Today
            </p>
          </motion.div>
        </motion.div>

        {/* Files Grid */}
        <motion.div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {files.map((file, index) => (
            <motion.div
              key={index}
              className='bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200 overflow-hidden'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                    <FileText className='w-6 h-6 text-blue-600' />
                  </div>
                  <div className='flex space-x-2'>
                    <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                      <ExternalLink className='w-5 h-5 text-gray-600' />
                    </button>
                    <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
                      <Download className='w-5 h-5 text-gray-600' />
                    </button>
                  </div>
                </div>

                <h3 className='text-lg font-semibold text-gray-800 mb-2 truncate'>
                  {file.name}
                </h3>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Size</p>
                    <p className='text-sm font-medium text-gray-700'>{file.size}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Modified</p>
                    <p className='text-sm font-medium text-gray-700'>{file.lastModified}</p>
                  </div>
                </div>

                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                    {file.type}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default FileList;