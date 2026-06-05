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

// In-memory popup storage
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
    tagId: '690e80748ec2830ebfefdae0',
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
        { status: 400, headers: mergeHeaders() }
      );
    }

    const popup = popupStore[popupId];
    if (!popup) {
      return Response.json(
        { success: false, error: `Popup not found: ${popupId}` },
        { status: 404, headers: mergeHeaders() }
      );
    }

    const fullName = firstName ? firstName.trim() : '';

    // Step 1: Create contact in Global Control
    let contactId = null;
    
    const gcResponse = await fetch(`${GC_API_URL}/contacts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': GC_API_KEY
      },
      body: JSON.stringify({
        email,
        name: fullName,
        phone: phone || '',
        notes: notes || `Signup from ${popupId}`
      })
    });

    if (gcResponse.ok) {
      const gcData = await gcResponse.json();
      if (gcData.type === 'response' && gcData.data) {
        contactId = gcData.data._id || gcData.data.id;
      }
    } else {
      // Contact might already exist - try to get contact ID
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
      } catch (e) {}
    }

    // Step 2: Fire the tag and re-add name (sync to ensure it completes)
    let tagFired = false;
    if (popup.tagId && contactId) {
      try {
        // Fire the tag
        const tagResponse = await fetch(`https://api.globalcontrol.io/api/ai/tags/fire-tag/${popup.tagId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': GC_API_KEY
          },
          body: JSON.stringify({ email })
        });
        
        if (tagResponse.ok) {
          tagFired = true;
          
          // WORKAROUND: Global Control tag fire API clears the contact name
          // Re-update the contact with the name after tag fire
          if (fullName) {
            await fetch(`${GC_API_URL}/contacts/${contactId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': GC_API_KEY
              },
              body: JSON.stringify({ name: fullName })
            });
          }
        }
      } catch (e) {}
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
