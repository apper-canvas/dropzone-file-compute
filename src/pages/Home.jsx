import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

import { toast } from 'react-toastify'
const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="backdrop-blur-custom bg-white/80 dark:bg-surface-900/80 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Upload" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                DropZone
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
{/* Test Section */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-card p-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-surface-800 mb-4">
            Application Test
          </h2>
          <p className="text-surface-600 mb-6">
            Click the button below to test if the application is working correctly
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.success('Test successful! Application is working correctly.')}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-medium shadow-soft hover:shadow-card transition-all duration-300"
          >
            Run Test
          </motion.button>
        </motion.div>
      </section>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <ApperIcon 
                  name={isDarkMode ? "Sun" : "Moon"} 
                  className="w-5 h-5 text-surface-600 dark:text-surface-400" 
                />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <ApperIcon name="Settings" className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MainFeature />
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 border-t border-surface-200 dark:border-surface-700 bg-white/50 dark:bg-surface-900/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Upload" className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  DropZone
                </span>
              </div>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Secure file management platform with drag-and-drop functionality, 
                real-time progress tracking, and collaborative sharing capabilities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-3">Features</h3>
              <ul className="space-y-2 text-surface-600 dark:text-surface-400">
                <li>Drag & Drop Upload</li>
                <li>File Organization</li>
                <li>Real-time Progress</li>
                <li>Secure Sharing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 mb-3">Support</h3>
              <ul className="space-y-2 text-surface-600 dark:text-surface-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-700 text-center text-surface-600 dark:text-surface-400">
            <p>&copy; 2024 DropZone. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home