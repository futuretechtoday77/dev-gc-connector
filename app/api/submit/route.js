/**
 * Form Submission Handler
 * Processes form submissions and sends to GlobalControl
 */

import { getSecurityHeaders, mergeHeaders } from '@/lib/security-headers';

// Import popup configs from the popups route
const staticPopups = {
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

    // Step 1: Submit to GlobalControl via gcmodal-api77 to create contact
    const gcResponse = await fetch('https://gcmodal-api77.vercel.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        popupId: 'Template Test Rife1', // Use existing working popup
        email,
        firstName: firstName || '',
        phone: phone || '',
        notes: notes || `Consultation request from ${popupId} - Tag: ${popup.tagId}`
      })
    });

    if (!gcResponse.ok) {
      const errorText = await gcResponse.text();
      console.error('GlobalControl error:', errorText);
      return Response.json(
        { success: false, error: 'Failed to submit to GlobalControl' },
        { status: 500, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }, getSecurityHeaders()) }
      );
    }

    const gcData = await gcResponse.json();

    // Step 2: Fire the tag using Global Control API directly
    // This ensures the contact is tagged for the consultation workflow
    if (popup.tagId) {
      try {
        const tagResponse = await fetch(`https://api.globalcontrol.io/api/ai/tags/fire-tag/${popup.tagId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.GLOBAL_CONTROL_API_KEY
          },
          body: JSON.stringify({ email })
        });
        
        if (!tagResponse.ok) {
          console.error('Tag firing failed:', await tagResponse.text());
          // Don't fail the submission if tagging fails
        } else {
          console.log('Tag fired successfully:', popup.tagId);
        }
      } catch (tagError) {
        console.error('Tag firing error:', tagError);
        // Don't fail the submission if tagging fails
      }
    }

    return Response.json(
      { 
        success: true, 
        message: 'Thank you for your submission!',
        contactId: gcData.contactId || gcData.id
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
