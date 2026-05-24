/**
 * Individual Split Test Admin API
 * GET, PUT, DELETE operations for specific tests
 * Plus complete/reopen/archive actions
 * 
 * v2.5.0 - Split Testing Feature
 */

import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN
const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40'

async function getSplitTest(testId) {
  try {
    if (!CONTROLBOARD_TOKEN) return null

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      headers: {
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    const settings = data.settings || {}
    const key = `split_test_${testId}`
    
    if (settings[key]) {
      return typeof settings[key] === 'string' ? JSON.parse(settings[key]) : settings[key]
    }
    
    return null
  } catch (error) {
    console.error('Error getting split test:', error)
    return null
  }
}

async function saveSplitTest(test) {
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
        key: `split_test_${test.testId}`,
        value: JSON.stringify(test)
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error saving split test:', error)
    return false
  }
}

/**
 * GET /api/admin/split-tests/[testId]
 * Get specific test details
 */
export async function GET(req, { params }) {
  try {
    await verifyAuth(req)
    const { testId } = params

    const test = await getSplitTest(testId)
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      test: test
    })

  } catch (error) {
    console.error('GET test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/admin/split-tests/[testId]
 * Update test (mainly for actions: complete, reopen, archive, unarchive)
 */
export async function PUT(req, { params }) {
  try {
    await verifyAuth(req)
    const { testId } = params
    const body = await req.json()
    const { action, winnerPopupId } = body

    const test = await getSplitTest(testId)
    
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      )
    }

    switch (action) {
      case 'complete':
        // Validate winner
        if (!winnerPopupId) {
          return NextResponse.json(
            { success: false, error: 'winnerPopupId required' },
            { status: 400 }
          )
        }
        
        if (winnerPopupId !== test.variantA.popupId && winnerPopupId !== test.variantB.popupId) {
          return NextResponse.json(
            { success: false, error: 'Winner must be one of the test variants' },
            { status: 400 }
          )
        }

        test.status = 'completed'
        test.winnerPopupId = winnerPopupId
        test.completedAt = new Date().toISOString()
        break

      case 'reopen':
        test.status = 'running'
        test.winnerPopupId = null
        test.completedAt = null
        break

      case 'archive':
        test.status = 'archived'
        test.archivedAt = new Date().toISOString()
        break

      case 'unarchive':
        // Restore to completed if it was completed, otherwise running
        if (test.completedAt) {
          test.status = 'completed'
        } else {
          test.status = 'running'
        }
        test.archivedAt = null
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: complete, reopen, archive, unarchive' },
          { status: 400 }
        )
    }

    const saved = await saveSplitTest(test)
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save test' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      test: test,
      message: `Test ${action}d successfully`
    })

  } catch (error) {
    console.error('PUT test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/split-tests/[testId]
 * Hard delete a test
 */
export async function DELETE(req, { params }) {
  try {
    await verifyAuth(req)
    const { testId } = params

    if (!CONTROLBOARD_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Control Board not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      },
      body: JSON.stringify({
        key: `split_test_${testId}`
      })
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete test' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    })

  } catch (error) {
    console.error('DELETE test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
