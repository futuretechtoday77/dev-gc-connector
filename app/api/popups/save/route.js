/**
 * Save Popup Configuration
 * Stores in Control Board (persistent storage) since Vercel filesystem is read-only
 * v2.9.0 - Auto-deployment: popups are live immediately, no git commit needed!
 */

import { savePopup } from '@/lib/controlboard';

export async function POST(request) {
  try {
    const { popup, isNew } = await request.json();
    
    console.log('💾 Saving popup:', popup.id, 'isNew:', isNew);

    // Build popup config with ALL v2.8.x fields
    const popupConfig = {
      name: popup.name,
      tagId: popup.tagId,
      template: popup.template || 'clean-gradient',
      design: {
        variant: popup.variant,
        layout: popup.layout,
        headline: popup.headline,
        subheadline: popup.subheadline,
        bodyCopy: popup.bodyCopy || '',
        buttonText: popup.buttonText,
        image: {
          url: popup.imageUrl || '',
          position: popup.imagePosition,
          scale: popup.imageScale || 100
        }
      },
      fields: [
        ...(popup.includeFirstName ? ['firstName'] : []),
        'email',
        ...(popup.includePhone ? ['phone'] : [])
      ],
      // New v2.8.x fields
      buttonColor: popup.buttonColor,
      buttonSize: popup.buttonSize,
      buttonIcon: popup.buttonIcon,
      popupHeight: popup.popupHeight,
      trustText: popup.trustText,
      showTrustText: popup.showTrustText,
      showOverlay: popup.showOverlay,
      overlayColor: popup.overlayColor,
      overlayOpacity: popup.overlayOpacity,
      useCustomTextColors: popup.useCustomTextColors,
      headlineColor: popup.headlineColor,
      subheadlineColor: popup.subheadlineColor,
      // Personal Consultation fields
      avatarUrl: popup.avatarUrl,
      avatarPosition: popup.avatarPosition,
      chatMessage: popup.chatMessage
    };

    // Save to Control Board - this makes it immediately available!
    await savePopup(popup.id, popupConfig, {
      isActive: true,
      createdAt: isNew ? new Date().toISOString() : undefined
    });

    console.log('✅ Saved to Control Board - popup is now LIVE!');

    // 🎉 AUTO-DEPLOYMENT: No git commit needed!
    // Popups are loaded dynamically from Control Board on each request
    // This means they're available immediately after saving

    return Response.json({
      success: true,
      message: isNew 
        ? `✅ "${popup.name}" created and is now LIVE! No deployment needed.`
        : `✅ "${popup.name}" updated and changes are LIVE!`,
      popup: popupConfig,
      popupId: popup.id,
      deployed: true,
      autoDeploy: true,
      implementationCode: `<!-- GC Modal Popup: ${popup.name} -->
<script src="https://gcmodal.vercel.app/gc-modal.js"></script>
<script>
  GCModal.init({
    popupId: '${popup.id}',
    apiUrl: 'https://gcmodal-api.vercel.app'
  });
</script>`,
      notes: [
        '✅ Popup is live immediately - no git commit needed!',
        '✅ Changes are available on next page load',
        '✅ Split tests can use this popup right away'
      ]
    });

  } catch (error) {
    console.error('❌ Save error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
