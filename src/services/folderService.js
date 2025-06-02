const { ApperClient } = window.ApperSDK

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const TABLE_NAME = 'folder1'

// All fields from the folder1 table
const ALL_FIELDS = [
  'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
  'file_count', 'created_date', 'is_public', 'parent_id'
]

// Only updateable fields for create/update operations
const UPDATEABLE_FIELDS = [
  'Name', 'Tags', 'Owner', 'file_count', 'created_date', 'is_public', 'parent_id'
]

export const folderService = {
  // Fetch all folders with optional filtering
  async fetchFolders(parentId = null, searchQuery = '') {
    try {
      const whereConditions = []
      
      // Filter by parent folder
      if (parentId) {
        whereConditions.push({
          fieldName: 'parent_id',
          operator: 'ExactMatch',
          values: [parentId]
        })
      } else {
        whereConditions.push({
          fieldName: 'parent_id',
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
      console.error('Error fetching folders:', error)
      throw error
    }
  },

  // Get a single folder by ID
  async getFolderById(folderId) {
    try {
      const params = {
        fields: ALL_FIELDS
      }

      const response = await apperClient.getRecordById(TABLE_NAME, folderId, params)
      
      if (!response || !response.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching folder with ID ${folderId}:`, error)
      throw error
    }
  },

  // Create a new folder
  async createFolder(folderData) {
    try {
      // Filter to only include updateable fields
      const filteredData = {}
      UPDATEABLE_FIELDS.forEach(field => {
        if (folderData.hasOwnProperty(field)) {
          filteredData[field] = folderData[field]
        }
      })

      // Set default values for required fields
      if (!filteredData.Name) {
        throw new Error('Folder name is required')
      }
      
      if (!filteredData.created_date) {
        filteredData.created_date = new Date().toISOString()
      }

      if (filteredData.is_public === undefined) {
        filteredData.is_public = false
      }

      if (!filteredData.file_count) {
        filteredData.file_count = 0
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
          throw new Error(result.message || 'Failed to create folder')
        }
      } else {
        throw new Error('Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  },

  // Update an existing folder
  async updateFolder(folderId, folderData) {
    try {
      // Filter to only include updateable fields and add ID
      const filteredData = { Id: folderId }
      UPDATEABLE_FIELDS.forEach(field => {
        if (folderData.hasOwnProperty(field)) {
          filteredData[field] = folderData[field]
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
          throw new Error(result.message || 'Failed to update folder')
        }
      } else {
        throw new Error('Failed to update folder')
      }
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  },

  // Delete folders
  async deleteFolders(folderIds) {
    try {
      const params = {
        RecordIds: Array.isArray(folderIds) ? folderIds : [folderIds]
      }

      const response = await apperClient.deleteRecord(TABLE_NAME, params)
      
      if (response && response.success) {
        return true
      } else {
        throw new Error('Failed to delete folders')
      }
    } catch (error) {
      console.error('Error deleting folders:', error)
      throw error
    }
  }
}

export default folderService