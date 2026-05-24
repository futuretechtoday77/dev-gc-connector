/**
 * Split Test Admin API
 * Create, manage, and track A/B split tests
 * 
 * v2.5.0 - Split Testing Feature
 */

import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'

// Control Board integration
const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN
const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40'

/**
 * Generate URL-safe test ID from name
 */
function generateTestId(name) {
  const date = new Date().toISOString().split('T')[0]
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  return `split-${slug}-${date}`
}

/**
 * Get all split tests from Control Board
 */
async function getAllSplitTests() {
  try {
    if (!CONTROLBOARD_TOKEN) {
      // Fallback: return empty if Control Board not configured
      return {}
    }

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      headers: {
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Control Board')
    }

    const data = await response.json()
    const settings = data.settings || {}

    // Extract split test configs
    const tests = {}
    Object.entries(settings).forEach(([key, value]) => {
      if (key.startsWith('split_test_')) {
        try {
          const testData = typeof value === 'string' ? JSON.parse(value) : value
          if (testData?.testId) {
            tests[testData.testId] = testData
          }
        } catch (e) {
          console.warn('Could not parse split test:', key)
        }
      }
    })

    return tests
  } catch (error) {
    console.error('Error fetching split tests:', error)
    return {}
  }
}

/**
 * Save split test to Control Board
 */
async function saveSplitTest(test) {
  try {
    if (!CONTROLBOARD_TOKEN) {
      throw new Error('Control Board not configured')
    }

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

    if (!response.ok) {
      throw new Error('Failed to save to Control Board')
    }

    return true
  } catch (error) {
    console.error('Error saving split test:', error)
    throw error
  }
}

/**
 * Delete split test from Control Board
 */
async function deleteSplitTest(testId) {
  try {
    if (!CONTROLBOARD_TOKEN) {
      throw new Error('Control Board not configured')
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

    return response.ok
  } catch (error) {
    console.error('Error deleting split test:', error)
    return false
  }
}

/**
 * GET /api/admin/split-tests
 * List all split tests
 */
export async function GET(req) {
  try {
    // Verify authentication
    await verifyAuth(req)

    const tests = await getAllSplitTests()

    return NextResponse.json({
      success: true,
      tests: tests
    })

  } catch (error) {
    console.error('GET split tests error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/admin/split-tests
 * Create new split test
 */
export async function POST(req) {
  try {
    // Verify authentication
    await verifyAuth(req)

    const body = await req.json()
    const { name, variantA, variantB, triggerType, triggerDelay, buttonId, buttonStyle } = body

    // Validation
    if (!name || !variantA || !variantB || !triggerType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, variantA, variantB, triggerType' },
        { status: 400 }
      )
    }

    // Validate trigger-specific fields
    if (triggerType === 'delay' && !triggerDelay) {
      return NextResponse.json(
        { success: false, error: 'triggerDelay required for delay trigger type' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existingTests = await getAllSplitTests()
    const nameExists = Object.values(existingTests).some(
      test => test.name.toLowerCase() === name.toLowerCase()
    )

    if (nameExists) {
      return NextResponse.json(
        { success: false, error: 'Test name already exists' },
        { status: 400 }
      )
    }

    // Generate test ID
    const testId = generateTestId(name)

    // Auto-generate buttonId for button triggers (use testId as button ID for simplicity)
    const finalButtonId = triggerType === 'button' 
      ? testId
      : null

    // Create test object
    const test = {
      testId,
      name,
      variantA: {
        popupId: variantA,
        conversions: 0
      },
      variantB: {
        popupId: variantB,
        conversions: 0
      },
      triggerType,
      triggerDelay: triggerDelay || null,
      buttonId: finalButtonId,
      buttonStyle: triggerType === 'button' ? (buttonStyle || null) : null,
      status: 'running',
      winnerPopupId: null,
      completedAt: null,
      archivedAt: null,
      uniqueConversions: {},
      createdAt: new Date().toISOString(),
      parentTestId: null
    }

    // Save to Control Board
    await saveSplitTest(test)

    // Generate implementation code
    const implementationCode = generateImplementationCode(test)

    return NextResponse.json({
      success: true,
      test: test,
      implementationCode: implementationCode,
      message: 'Split test created successfully'
    })

  } catch (error) {
    console.error('POST split test error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * Generate implementation code for a test
 */
function generateImplementationCode(test) {
  const baseCode = `<!-- GC Modal: Universal Script (already on your site) -->
<script src="https://gcmodal.vercel.app/gc-modal.js"></script>
<script>
  GCModal.initUniversal({
    apiUrl: 'https://gcmodal-api77.vercel.app'
  });
</script>`

  let triggerCode = ''

  if (test.triggerType === 'button') {
    // Use custom button styles if available, otherwise use defaults
    const bs = test.buttonStyle || {
      text: 'Get Free Report',
      bgColor: '#6B46C1',
      textColor: '#ffffff',
      fontSize: '16px',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '6px',
      padding: '12px 24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontWeight: 'bold',
      align: 'center'
    }
    
    const alignStyles = {
      left: 'text-align: left;',
      center: 'text-align: center;',
      right: 'text-align: right;'
    }
    
    triggerCode = `
<!-- Trigger: Button Click -->
<!-- Copy this button HTML to your site: -->
<div style="${alignStyles[bs.align] || 'text-align: center;'}">
  <button 
    id="${test.buttonId}"
    style="
      background: ${bs.bgColor};
      color: ${bs.textColor};
      font-size: ${bs.fontSize};
      font-family: ${bs.fontFamily};
      font-weight: ${bs.fontWeight};
      padding: ${bs.padding};
      border: none;
      border-radius: ${bs.borderRadius};
      box-shadow: ${bs.boxShadow};
      cursor: pointer;
    "
  >
    ${bs.text}
  </button>
</div>`
  } else if (test.triggerType === 'exit') {
    triggerCode = `
<!-- Trigger: Exit Intent (auto-detects mouse leaving viewport) -->
<!-- No additional code needed - automatically triggers on exit intent -->`
  } else if (test.triggerType === 'delay') {
    triggerCode = `
<!-- Trigger: Time Delay (${test.triggerDelay}s = ${Math.floor(test.triggerDelay / 60)}m ${test.triggerDelay % 60}s) -->
<!-- Automatically triggers after ${test.triggerDelay} seconds on page -->`
  }

  return `${baseCode}\n${triggerCode}`
}
