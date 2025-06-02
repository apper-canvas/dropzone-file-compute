import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([
    { id: '1', name: 'Documents', parentId: null, fileCount: 0, createdDate: new Date() },
    { id: '2', name: 'Images', parentId: null, fileCount: 0, createdDate: new Date() },
    { id: '3', name: 'Projects', parentId: null, fileCount: 0, createdDate: new Date() }
  ])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // 'name', 'size', 'date'
  const fileInputRef = useRef(null)

  // File type icons mapping
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'Image'
    if (type.startsWith('video/')) return 'Video'
    if (type.startsWith('audio/')) return 'Music'
    if (type.includes('pdf')) return 'FileText'
    if (type.includes('zip') || type.includes('rar')) return 'Archive'
    if (type.includes('word') || type.includes('doc')) return 'FileText'
    if (type.includes('excel') || type.includes('sheet')) return 'Table'
    if (type.includes('powerpoint') || type.includes('presentation')) return 'Presentation'
    return 'File'
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle file upload
  const handleFileUpload = useCallback((fileList) => {
    Array.from(fileList).forEach(file => {
const fileId = Date.now() + Math.random().toString(36).substring(2, 9)
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        lastModified: new Date(file.lastModified),
        url: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        folderId: currentFolder,
        tags: [],
        isPublic: false,
        uploadProgress: 0
      }

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fileId] || 0
          const newProgress = Math.min(currentProgress + Math.random() * 20, 100)
          
          if (newProgress >= 100) {
            clearInterval(progressInterval)
            setFiles(prevFiles => [...prevFiles, { ...newFile, uploadProgress: 100 }])
            setTimeout(() => {
              setUploadProgress(prev => {
                const { [fileId]: removed, ...rest } = prev
                return rest
              })
            }, 1000)
            toast.success(`${file.name} uploaded successfully!`)
          }
          
          return { ...prev, [fileId]: newProgress }
        })
      }, 200)
    })
  }, [currentFolder])

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles)
    }
  }, [handleFileUpload])

  // File selection
  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // Delete selected files
  const deleteSelectedFiles = () => {
    if (selectedFiles.size === 0) return
    
    setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)))
    setSelectedFiles(new Set())
    toast.success(`${selectedFiles.size} file(s) deleted successfully!`)
  }

  // Create new folder
  const createFolder = () => {
    const folderName = prompt('Enter folder name:')
    if (folderName && folderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: folderName.trim(),
        parentId: currentFolder,
        fileCount: 0,
        createdDate: new Date(),
        isPublic: false
      }
      setFolders(prev => [...prev, newFolder])
      toast.success(`Folder "${folderName}" created successfully!`)
    }
  }

  // Filter and sort files
  const filteredFiles = files
    .filter(file => 
      file.folderId === currentFolder &&
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size
        case 'date':
          return new Date(b.uploadDate) - new Date(a.uploadDate)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Get current folder info
  const currentFolderInfo = currentFolder ? folders.find(f => f.id === currentFolder) : null

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
            {currentFolderInfo ? currentFolderInfo.name : 'My Files'}
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            {filteredFiles.length} files • {folders.filter(f => f.parentId === currentFolder).length} folders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createFolder}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg transition-colors"
          >
            <ApperIcon name="FolderPlus" className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <ApperIcon name="Upload" className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Files</span>
          </motion.button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {currentFolder && (
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentFolder(null)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Home
          </motion.button>
          <ApperIcon name="ChevronRight" className="w-4 h-4 text-surface-400" />
          <span className="text-surface-600 dark:text-surface-400">{currentFolderInfo?.name}</span>
        </motion.nav>
      )}

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="date">Sort by Date</option>
          </select>
          
          <div className="flex rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'
              }`}
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'
              }`}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </button>
          </div>
          
          {selectedFiles.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={deleteSelectedFiles}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
              <span>Delete ({selectedFiles.size})</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`file-upload-area ${isDragOver ? 'dragover' : ''} p-8 text-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        
        <motion.div
          animate={{ scale: isDragOver ? 1.1 : 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <ApperIcon name="Upload" className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
              {isDragOver ? 'Drop files here!' : 'Drag & drop files here'}
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              or click to browse your computer
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-card"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              <span>Choose Files</span>
</motion.button>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-surface-900 dark:text-surface-100">Uploading Files</h3>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="bg-white dark:bg-surface-800 rounded-lg p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    Uploading file...
                  </span>
                  <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className="progress-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folders */}
      {folders.filter(f => f.parentId === currentFolder).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Folders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders
              .filter(folder => folder.parentId === currentFolder)
              .map(folder => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="folder-item bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-soft cursor-pointer border border-surface-200 dark:border-surface-700"
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-orange-500 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Folder" className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                        {folder.name}
                      </h4>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {folder.fileCount} files
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Files */}
      {filteredFiles.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Files</h3>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`file-item cursor-pointer ${
                    selectedFiles.has(file.id) ? 'ring-2 ring-primary bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  <div className="aspect-square bg-surface-100 dark:bg-surface-700 rounded-lg mb-3 overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ApperIcon 
                          name={getFileIcon(file.type)} 
                          className="w-12 h-12 text-surface-400 dark:text-surface-500" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate mb-1">
                    {file.name}
                  </h4>
                  <div className="text-sm text-surface-500 dark:text-surface-400 space-y-1">
                    <p>{formatFileSize(file.size)}</p>
                    <p>{formatDistanceToNow(file.uploadDate, { addSuffix: true })}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <div className="divide-y divide-surface-200 dark:divide-surface-700">
                {filteredFiles.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center space-x-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-700 cursor-pointer transition-colors ${
                      selectedFiles.has(file.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <div className="w-10 h-10 bg-surface-100 dark:bg-surface-600 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getFileIcon(file.type)} 
                        className="w-5 h-5 text-surface-500 dark:text-surface-400" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                        {file.name}
                      </h4>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {formatFileSize(file.size)} • {formatDistanceToNow(file.uploadDate, { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-surface-400 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle share functionality
                          toast.info('Share link copied to clipboard!')
                        }}
                      >
                        <ApperIcon name="Share2" className="w-4 h-4" />
                      </motion.button>
                      
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={file.url}
                        download={file.name}
                        className="p-2 text-surface-400 hover:text-secondary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ApperIcon name="Download" className="w-4 h-4" />
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : filteredFiles.length === 0 && files.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="Search" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No files found
          </h3>
          <p className="text-surface-600 dark:text-surface-400">
            Try adjusting your search terms or upload some files to get started.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="FileText" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
            No files yet
          </h3>
          <p className="text-surface-600 dark:text-surface-400">
            Upload your first file using the area above.
          </p>
        </motion.div>
      )}

      {/* Storage Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-surface-800 rounded-xl p-6 shadow-card border border-surface-200 dark:border-surface-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">Storage Usage</h3>
          <span className="text-sm text-surface-500 dark:text-surface-400">
            {formatFileSize(files.reduce((total, file) => total + file.size, 0))} of 5 GB used
          </span>
        </div>
        
        <div className="storage-meter h-3 mb-2">
          <motion.div
            className="storage-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: `${(files.reduce((total, file) => total + file.size, 0) / (5 * 1024 * 1024 * 1024)) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-surface-600 dark:text-surface-400">
<span>Free: {formatFileSize(5 * 1024 * 1024 * 1024 - files.reduce((total, file) => total + (file.size || 0), 0))}</span>
          <span>{files.length} files</span>
        </div>
      </motion.div>
    </div>
  )
}

export default MainFeature