import { headers } from 'next/headers';

// CORS headers helper
const getSecurityHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

const mergeHeaders = (additional = {}) => ({
  ...getSecurityHeaders(),
  ...additional
});

// Global Control API configuration
const GC_API_URL = 'https://api.globalcontrol.io/api/ai';
const GC_API_KEY = process.env.GLOBAL_CONTROL_API_KEY;

// In-memory popup storage (populated from Control Board or defaults)
const popupStore = {
  'Template Test Rife1': {
    tagId: '68cb4cbb97f1fa5d35ebf6f3',
    design: {
      variant: 'teal',
      layout: 'centered',
      headline: 'Get Instant Access',
      subheadline: 'Enter your details below',
      bodyCopy: '',
      buttonText: 'Send My Login Info Now',
      image: { url: '', position: 'none' }
    },
    fields: ['firstName', 'email']
  },
  'Consultation Rife1': {
    tagId: '690e80748ec2830ebfefdae0',  // Same consultation tag for now
    design: {
      variant: 'purple',
      layout: 'centered',
      headline: 'Get Instant Access',
      subheadline: 'Enter your details below',
      bodyCopy: '',
      buttonText: 'Send My Login Info Now',
      image: { url: '', position: 'none' }
    },
    fields: ['firstName', 'email']
  }
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { popupId, email, firstName, phone, notes } = body;

    if (!popupId || !email) {
      return Response.json(
        { success: false, error: 'Missing required fields: popupId and email' },
        { status: 400, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }) }
      );
    }

    // Get popup configuration
    const popup = popupStore[popupId];
    if (!popup) {
      return Response.json(
        { success: false, error: `Popup not found: ${popupId}` },
        { status: 404, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }) }
      );
    }

    // Build name field from firstName
    const fullName = firstName ? firstName.trim() : '';
    console.log('DEBUG: received firstName:', firstName, '| fullName:', fullName);

    // Step 1: Create or update contact in Global Control
    let contactId = null;
    
    const requestBody = JSON.stringify({
      email,
      name: fullName,
      phone: phone || '',
      notes: notes || `Signup from ${popupId}`
    });
    console.log('DEBUG: request body:', requestBody);
    
    const gcResponse = await fetch(`${GC_API_URL}/contacts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': GC_API_KEY
      },
      body: requestBody
    });

    if (gcResponse.ok) {
      const gcData = await gcResponse.json();
      console.log('DEBUG: GC response:', JSON.stringify(gcData.data || {}).substring(0, 200));
      if (gcData.type === 'response' && gcData.data) {
        contactId = gcData.data._id || gcData.data.id;
      }
    } else {
      // Contact might already exist - try to get contact ID by email
      try {
        const searchResponse = await fetch(`${GC_API_URL}/contacts?search=${encodeURIComponent(email)}`, {
          headers: { 'X-API-KEY': GC_API_KEY }
        });
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.type === 'response' && searchData.data && searchData.data.length > 0) {
            contactId = searchData.data[0]._id;
          }
        }
      } catch (e) {
        // Ignore search errors
      }
    }

    // Step 2: Fire the tag (if configured) - fire and forget for speed
    let tagFired = false;
    if (popup.tagId && contactId) {
      tagFired = true; // Optimistically assume it will work
      
      // Fire tag without awaiting response for speed
      fetch(`https://api.globalcontrol.io/api/ai/tags/fire-tag/${popup.tagId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': GC_API_KEY
        },
        body: JSON.stringify({ email })
      }).then(async () => {
        // Wait a moment for the tag to be processed, then re-update the name
        await new Promise(r => setTimeout(r, 500));
        // WORKAROUND: Global Control tag fire API clears the contact name
        if (fullName && contactId) {
          await fetch(`${GC_API_URL}/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': GC_API_KEY
            },
            body: JSON.stringify({ name: fullName })
          });
          console.log('DEBUG: Name re-added after tag fire');
        }
      }).catch(() => {});
    } else if (popup.tagId && !contactId) {
      console.log('DEBUG: No contactId, cannot fire tag with name preservation');
    }

    return Response.json(
      { 
        success: true, 
        message: 'Thank you for your submission!',
        contactId: contactId,
        tagFired: tagFired,
        tagId: popup.tagId
      },
      { headers: mergeHeaders() }
    );

  } catch (error) {
    console.error('Submit error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: mergeHeaders() }
    );
  }
}

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: mergeHeaders()
  });
}
