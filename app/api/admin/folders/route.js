/**
 * Folder Management API
 * Organize popups and split tests into folders
 * 
 * v2.5.3 - Folder Organization Feature
 */

import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN
const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40'

/**
 * Get all folders from Control Board
 */
async function getAllFolders() {
  try {
    if (!CONTROLBOARD_TOKEN) return []

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      headers: {
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      }
    })

    if (!response.ok) return []

    const data = await response.json()
    const settings = data.settings || {}

    // Extract folder configs
    const folders = []
    Object.entries(settings).forEach(([key, value]) => {
      if (key.startsWith('folder_')) {
        try {
          const folderData = typeof value === 'string' ? JSON.parse(value) : value
          if (folderData?.id) {
            folders.push(folderData)
          }
        } catch (e) {
          console.warn('Could not parse folder:', key)
        }
      }
    })

    return folders.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching folders:', error)
    return []
  }
}

/**
 * Save folder to Control Board
 */
async function saveFolder(folder) {
  try {
    if (!CONTROLBOARD_TOKEN) throw new Error('Control Board not configured')

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      },
      body: JSON.stringify({
        key: `folder_${folder.id}`,
        value: JSON.stringify(folder)
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error saving folder:', error)
    return false
  }
}

/**
 * Delete folder from Control Board
 */
async function deleteFolder(folderId) {
  try {
    if (!CONTROLBOARD_TOKEN) throw new Error('Control Board not configured')

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      },
      body: JSON.stringify({
        key: `folder_${folderId}`
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting folder:', error)
    return false
  }
}

/**
 * GET /api/admin/folders
 * List all folders
 */
export async function GET(req) {
  try {
    await verifyAuth(req)

    const folders = await getAllFolders()

    return NextResponse.json({
      success: true,
      folders: folders
    })

  } catch (error) {
    console.error('GET folders error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/admin/folders
 * Create new folder
 */
export async function POST(req) {
  try {
    await verifyAuth(req)

    const body = await req.json()
    const { name, type, parentId = null } = body

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type' },
        { status: 400 }
      )
    }

    if (!['popup', 'splittest'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "popup" or "splittest"' },
        { status: 400 }
      )
    }

    // Generate folder ID
    const folderId = `folder-${type}-${Date.now()}`

    const folder = {
      id: folderId,
      name: name.trim(),
      type: type, // 'popup' or 'splittest'
      parentId: parentId,
      items: [], // Array of popupIds or testIds
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const saved = await saveFolder(folder)
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      folder: folder,
      message: 'Folder created successfully'
    })

  } catch (error) {
    console.error('POST folder error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/admin/folders
 * Update folder (rename, move items, etc.)
 */
export async function PUT(req) {
  try {
    await verifyAuth(req)

    const body = await req.json()
    const { folderId, action, ...data } = body

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Missing folderId' },
        { status: 400 }
      )
    }

    // Get existing folder
    const folders = await getAllFolders()
    const folder = folders.find(f => f.id === folderId)
    
    if (!folder) {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'rename':
        if (!data.name) {
          return NextResponse.json(
            { success: false, error: 'Missing name for rename' },
            { status: 400 }
          )
        }
        folder.name = data.name.trim()
        break

      case 'move':
        // Move folder to different parent
        folder.parentId = data.parentId || null
        break

      case 'addItem':
        // Add item to folder
        if (!data.itemId) {
          return NextResponse.json(
            { success: false, error: 'Missing itemId' },
            { status: 400 }
          )
        }
        if (!folder.items.includes(data.itemId)) {
          folder.items.push(data.itemId)
        }
        break

      case 'removeItem':
        // Remove item from folder
        if (!data.itemId) {
          return NextResponse.json(
            { success: false, error: 'Missing itemId' },
            { status: 400 }
          )
        }
        folder.items = folder.items.filter(id => id !== data.itemId)
        break

      case 'reorder':
        // Reorder items in folder
        if (data.items) {
          folder.items = data.items
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

    folder.updatedAt = new Date().toISOString()

    const saved = await saveFolder(folder)
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      folder: folder,
      message: 'Folder updated successfully'
    })

  } catch (error) {
    console.error('PUT folder error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/folders
 * Delete folder
 */
export async function DELETE(req) {
  try {
    await verifyAuth(req)

    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('id')

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Missing folderId' },
        { status: 400 }
      )
    }

    const deleted = await deleteFolder(folderId)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    })

  } catch (error) {
    console.error('DELETE folder error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
