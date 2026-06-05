/**
 * Form Submission Handler
 * Processes form submissions and sends to GlobalControl
 */

import { getSecurityHeaders, mergeHeaders } from '@/lib/security-headers';

// Import popup configs from the popups route
const staticPopups = {
  'Template Test Rife1': {
    name: 'Rife Frequency Code - Main Optin',
    tagId: '68cb4cbb97f1fa5d35ebf6f3',
    design: {
      variant: 'teal',
      layout: 'centered',
      headline: 'Watch The Free Training',
      subheadline: 'Enter your details to get instant access',
      bodyCopy: '',
      buttonText: 'Send Me The Free Video',
      image: { url: '', position: 'none' }
    },
    fields: ['firstName', 'email']
  },
  'Consultation Rife1': {
    name: 'Rife Consultation Request',
    tagId: '690e80748ec2830ebfefdae0',
    design: {
      variant: 'teal',
      layout: 'centered',
      headline: 'Book Your Free Consultation',
      subheadline: 'Enter your details and we will contact you to schedule your call',
      bodyCopy: '',
      buttonText: 'Book My Free Consultation',
      image: { url: '', position: 'none' }
    },
    fields: ['firstName', 'email', 'phone']
  },
  'ForbiddenFood Nitrilosides': {
    name: 'ForbiddenFood Nitrilosides Signup',
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
          'Access-Control-Allow-Headers': 'Content-Type'
        }, getSecurityHeaders()) }
      );
    }

    // Get popup config
    const popup = staticPopups[popupId];
    if (!popup) {
      return Response.json(
        { success: false, error: 'Invalid popup or popup not found' },
        { status: 404, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }, getSecurityHeaders()) }
      );
    }

    // Step 1: Create contact directly via Global Control API
    const GC_API_URL = 'https://api.globalcontrol.io/api/ai';
    const GC_API_KEY = process.env.GLOBAL_CONTROL_API_KEY;
    
    if (!GC_API_KEY) {
      console.error('Missing GLOBAL_CONTROL_API_KEY');
      return Response.json(
        { success: false, error: 'Server configuration error' },
        { status: 500, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }, getSecurityHeaders()) }
      );
    }
    
    console.log('Creating contact in Global Control...');
    console.log('Received firstName:', firstName);
    
    // Build name field from firstName
    const fullName = firstName ? firstName.trim() : '';
    console.log('Full name to send:', fullName);
    
    const requestBody = JSON.stringify({
      email,
      name: fullName,
      phone: phone || '',
      notes: notes || `Signup from ${popupId}`
    });
    console.log('Request body:', requestBody);
    
    const gcResponse = await fetch(`${GC_API_URL}/contacts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-KEY': GC_API_KEY
      },
      body: requestBody
    });
    
    console.log('GC response status:', gcResponse.status);

    let contactId = null;
    let gcData = null;
    
    if (gcResponse.ok) {
      gcData = await gcResponse.json();
      console.log('Global Control response:', JSON.stringify(gcData).substring(0, 200));
      
      // Extract contact ID from response
      if (gcData.type === 'response' && gcData.data) {
        contactId = gcData.data._id || gcData.data.id;
        console.log('Contact created with ID:', contactId);
      }
    } else {
      const errorText = await gcResponse.text();
      console.error('GlobalControl contact creation failed:', errorText);
      // Continue anyway - contact might already exist
    }

    // Step 2: Fire the tag using Global Control API directly
    // This ensures the contact is tagged for the consultation workflow
    let tagFired = false;
    if (popup.tagId) {
      try {
        console.log('Firing tag:', popup.tagId, 'for email:', email);
        const tagResponse = await fetch(`https://api.globalcontrol.io/api/ai/tags/fire-tag/${popup.tagId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': GC_API_KEY
          },
          body: JSON.stringify({ email })
        });
        
        const tagData = await tagResponse.json();
        console.log('Tag fire response:', JSON.stringify(tagData).substring(0, 300));
        
        if (tagResponse.ok && tagData.type === 'response') {
          console.log('✅ Tag fired successfully:', popup.tagId);
          tagFired = true;
        } else {
          console.error('❌ Tag firing failed:', tagData);
        }
      } catch (tagError) {
        console.error('❌ Tag firing error:', tagError);
      }
    }

    return Response.json(
      { 
        success: true, 
        message: 'Thank you for your submission!',
        contactId: contactId,
        tagFired: tagFired,
        tagId: popup.tagId,
        debug: { receivedFirstName: firstName, sentName: fullName }
      },
      { headers: mergeHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }, getSecurityHeaders()) }
    );

  } catch (error) {
    console.error('Submit error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: mergeHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }, getSecurityHeaders()) }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
