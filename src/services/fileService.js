const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const TABLE_NAME = 'file1'

// All fields from the file1 table
const ALL_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'size', 'type', 'upload_date', 'last_modified', 'url', 'thumbnail_url', 'is_public', 'folder_id'
]

// Only updateable fields for create/update operations
const UPDATEABLE_FIELDS = [
  'Name', 'Tags', 'Owner', 'size', 'type', 'upload_date', 'last_modified', 
  'url', 'thumbnail_url', 'is_public', 'folder_id'
]

export const fileService = {
  // Fetch all files with optional filtering
  async fetchFiles(folderId = null, searchQuery = '') {
    try {
      const whereConditions = []
      
      // Filter by folder
      if (folderId) {
        whereConditions.push({
          fieldName: 'folder_id',
          operator: 'ExactMatch',
          values: [folderId]
        })
      } else {
        whereConditions.push({
          fieldName: 'folder_id',
          operator: 'DoesNotHaveValue',
          values: []
        })
      }
      
      // Add search filter if provided
      if (searchQuery && searchQuery.trim()) {
        whereConditions.push({
          fieldName: 'Name',
          operator: 'Contains',
          values: [searchQuery.trim()]
        })
      }

      const params = {
        fields: ALL_FIELDS,
        where: whereConditions,
        orderBy: [
          {
            fieldName: 'Name',
            SortType: 'ASC'
          }
        ]
      }

      const response = await apperClient.fetchRecords(TABLE_NAME, params)
      
      if (!response || !response.data) {
        return []
      }
      
      return response.data
    } catch (error) {
      console.error('Error fetching files:', error)
      throw error
    }
  },

  // Get a single file by ID
  async getFileById(fileId) {
    try {
      const params = {
        fields: ALL_FIELDS
      }

      const response = await apperClient.getRecordById(TABLE_NAME, fileId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching file with ID ${fileId}:`, error)
      throw error
    }
  },

  // Create a new file
  async createFile(fileData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      UPDATEABLE_FIELDS.forEach(field => {
        if (fileData.hasOwnProperty(field)) {
          filteredData[field] = fileData[field]
        }
      })

      // Set default values for required fields
      if (!filteredData.Name) {
        throw new Error('File name is required')
      }
      
      if (!filteredData.upload_date) {
        filteredData.upload_date = new Date().toISOString()
      }

      if (!filteredData.last_modified) {
        filteredData.last_modified = new Date().toISOString()
      }

      if (filteredData.is_public === undefined) {
        filteredData.is_public = false
      }

      if (!filteredData.size) {
        filteredData.size = 0
      }

      const params = {
        records: [filteredData]
      }

      const response = await apperClient.createRecord(TABLE_NAME, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const result = response.results[0]
        if (result.success) {
          return result.data
        } else {
          throw new Error(result.message || 'Failed to create file')
        }
      } else {
        throw new Error('Failed to create file')
      }
    } catch (error) {
      console.error('Error creating file:', error)
      throw error
    }
  },

  // Update an existing file
  async updateFile(fileId, fileData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: fileId }
      UPDATEABLE_FIELDS.forEach(field => {
        if (fileData.hasOwnProperty(field)) {
          filteredData[field] = fileData[field]
        }
      })

      const params = {
        records: [filteredData]
      }

      const response = await apperClient.updateRecord(TABLE_NAME, params)
      
      if (response && response.success && response.results && response.results.length > 0) {
        const result = response.results[0]
        if (result.success) {
          return result.data
        } else {
          throw new Error(result.message || 'Failed to update file')
        }
      } else {
        throw new Error('Failed to update file')
      }
    } catch (error) {
      console.error('Error updating file:', error)
      throw error
    }
  },

  // Delete files
  async deleteFiles(fileIds) {
    try {
      const params = {
        RecordIds: Array.isArray(fileIds) ? fileIds : [fileIds]
      }

      const response = await apperClient.deleteRecord(TABLE_NAME, params)
      
      if (response && response.success) {
        return true
      } else {
        throw new Error('Failed to delete files')
      }
    } catch (error) {
      console.error('Error deleting files:', error)
      throw error
    }
  }
}

export default fileService