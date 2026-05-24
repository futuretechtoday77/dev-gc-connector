/**
 * Delete Popup Configuration
 * Marks popups as inactive in Control Board (hides them without removing data)
 */

export async function POST(request) {
  try {
    const { popupId } = await request.json();
    
    console.log('🗑️ Deactivating popup:', popupId);

    const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN;
    const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40';
    
    if (!CONTROLBOARD_TOKEN) {
      throw new Error('Control Board token not configured');
    }

    // First, fetch the existing popup data to preserve it
    const fetchResponse = await fetch(`https://control.clawlauncher.io/api/settings?key=popup_${popupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      }
    });

    let existingPopup = null;
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      existingPopup = fetchData.value;
    }

    // Mark popup as inactive (hidden) while preserving all data
    const deactivateResponse = await fetch('https://control.clawlauncher.io/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      },
      body: JSON.stringify({
        key: `popup_${popupId}`,
        value: {
          ...existingPopup,
          _inactive: true,
          _deactivatedAt: new Date().toISOString()
        }
      })
    });

    if (!deactivateResponse.ok) {
      const errorData = await deactivateResponse.text();
      throw new Error(`Control Board deactivate failed: ${errorData}`);
    }

    console.log('✅ Popup deactivated in Control Board');

    return Response.json({
      success: true,
      message: `Popup "${popupId}" hidden successfully! Changes are live immediately.`
    });

  } catch (error) {
    console.error('❌ Deactivate error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
