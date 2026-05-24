/**
 * Export Popup Configuration
 * Returns the current popups config as downloadable code
 */

export async function POST(request) {
  try {
    const { popup, action } = await request.json(); // action: 'add', 'update', 'delete'
    
    // For now, return instructions
    return Response.json({
      success: true,
      action: action,
      popup: popup,
      instructions: `To ${action} this popup:
      
1. Edit: ~/.openclaw/workspace/gcmodal-api/app/api/popups/route.js
2. ${action === 'delete' ? `Remove the '${popup.id}' entry` : `Add/update the popup config`}
3. Run: cd ~/.openclaw/workspace/gcmodal-api && vercel --prod

Or ask Nikola to do it for you!`
    });

  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
