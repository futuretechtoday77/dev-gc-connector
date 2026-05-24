/**
 * Individual Popup Endpoint
 * Returns popup config by ID
 * Handles both regular popups and split tests
 * 
 * v2.5.0 - Split Testing Feature
 */

import { getSecurityHeaders, mergeHeaders } from '@/lib/security-headers';

const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN;
const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40';

/**
 * Get all static popups (from main route)
 * This mirrors the logic in /api/popups/route.js
 */
async function getStaticPopups() {
  // Static popup configurations
  const staticPopups = {
    'nitrilosides-optin': {
      name: 'Nitrilosides Free Access',
      tagId: '69a02963430175cb1007f09d',
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
    },
    'frequency-generator-report': {
      name: 'Frequency Generator Report',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'purple',
        layout: 'side-by-side',
        headline: 'Discover The Truth About "Rife Machines"',
        subheadline: 'Free Special Report Reveals Why These Devices May Do More Harm Than Good',
        bodyCopy: 'Enter your email below and I\'ll send you instant access to my investigative report exposing the frequency generator industry.',
        buttonText: 'Send Report To My Email!',
        image: { url: 'https://gcmodal.vercel.app/frequency-generator-book.jpg', position: 'left-side' }
      },
      fields: ['firstName', 'email']
    },
    'forbiddenfood-apricots': {
      name: 'ForbiddenFood - Fresh Apricots',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: "The Seed They Don't Want You To Know About",
        subheadline: 'Discover why this ancient food was quietly removed from modern nutrition advice',
        bodyCopy: 'Inside this free report: The shocking connection between apricot seeds and a vitamin that was once considered essential to human health.',
        buttonText: 'Send Me The Free Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-apricots-E3EBcacdDYLhQ4uosbGgxj9FfRUbQK.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'forbiddenfood-research-v1': {
      name: 'ForbiddenFood - Research Reports (Restricted)',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Declassified: The Cancer Studies They Buried',
        subheadline: '1940-1962 research on nitrilosides was marked RESTRICTED and suppressed for decades',
        bodyCopy: 'Now declassified: Read the original research reports that challenged everything we were told about nutrition and health.',
        buttonText: 'Access The Declassified Reports',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v1-aQPLZkMFZbz6v84kH1awkTKaXGG2UG.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'forbiddenfood-research-v2': {
      name: 'ForbiddenFood - Research Reports (Declassified)',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Missing Vitamin: A 22-Year Investigation',
        subheadline: 'National Research Council documents reveal decades of suppressed biochemical research',
        bodyCopy: 'Enter your email to receive the complete nitrilosides research archive — studies that were hidden from public view for over 50 years.',
        buttonText: 'Send Me The Research Archive',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v2-sb1SNKQzrmazn0qmvgNrruePKXNKD4.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'forbiddenfood-research-v3': {
      name: 'ForbiddenFood - AMRI Research Cover',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'What The American Medical Research Institute Discovered',
        subheadline: 'Professional archival documents from 1940-1962 reveal startling findings about natural compounds',
        bodyCopy: 'These institutional research reports were never meant for public eyes. Now you can read what they found.',
        buttonText: 'Get The Institute Reports',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v3-aUryyixguVDJoanjoS95dxU1wG2YiK.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'forbiddenfood-research-v4': {
      name: 'ForbiddenFood - Simplified Research',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Declassified Cancer Studies of 1940-1962',
        subheadline: 'Tea-stained primary source documents reveal research that was classified and forgotten',
        bodyCopy: 'Microscope icons, confidential stamps, and decades of suppressed science — all in one free report.',
        buttonText: 'Send Me The Declassified File',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v4-A4kaGUaikmgQkYkUbP5rOPBq23fz2f.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'forbiddenfood-research-v5': {
      name: 'ForbiddenFood - Top Secret File',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'TOP SECRET: *** Nitrilosides File',
        subheadline: 'National Cancer Research Institute archive — declassified after 25 years',
        bodyCopy: 'The most dramatic of the suppressed documents. Eagle seals, top secret stamps, and the truth that was buried in 1962.',
        buttonText: 'Access The Top Secret File',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v5-HqLkto19oKCVgqFzDKvU9yAV7WuKvm.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'rifelead-scientist-bw': {
      name: 'RifeLead - Vintage Scientist Lab',
      tagId: '68cb4cbb97f1fa5d35ebf6f3',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Forgotten Frequency Discoveries of the 1930s',
        subheadline: 'Before modern medicine, pioneering researchers were exploring something remarkable',
        bodyCopy: 'Historical photographs from the original frequency research laboratories. Discover what they knew that we forgot.',
        buttonText: 'Send Me The Historical Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-scientist-bw-NyRzMRFVkQCIXmC4fQHvRLo5jvgfCk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'rifelead-scientist-sepia': {
      name: 'RifeLead - Sepia Scientist Portrait',
      tagId: '68cb4cbb97f1fa5d35ebf6f3',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Meet The Man Who Saw What Others Couldn\'t',
        subheadline: 'A lifetime of dedication to understanding the frequency spectrum of life',
        bodyCopy: 'His workshop, his instruments, his discoveries — all revealed in this exclusive historical documentation.',
        buttonText: 'Get The Complete Story',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-scientist-sepia-xp2jRuxSBxMfExXAlnjUXFhOZngjYK.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'rifelead-microscope': {
      name: 'RifeLead - Glowing Microscope',
      tagId: '68cb4cbb97f1fa5d35ebf6f3',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Microscope That Changed Everything',
        subheadline: 'A breakthrough device that revealed secrets invisible to conventional science',
        bodyCopy: 'Discover the story of the universal microscope and why its technology was never replicated.',
        buttonText: 'Send Me The Microscope Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-microscope-8VLoNzr2SKTfDf1yxSvgHS77dxAPzX.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'rifelead-waveforms': {
      name: 'RifeLead - Frequency Waveforms',
      tagId: '68cb4cbb97f1fa5d35ebf6f3',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Mathematics of Cellular Resonance',
        subheadline: 'Specific frequencies, precise calculations, and the science that was never taught',
        bodyCopy: 'Original equations, waveform diagrams, and the frequency protocols that emerged from decades of research.',
        buttonText: 'Access The Frequency Data',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-waveforms-zERaEow0nQ39298PxHPY8RoeDrKh1X.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-athlete': {
      name: 'RedLightResearch - The Secret To Aging Backwards',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'FREE REPORT: The Secret To Aging Backwards',
        subheadline: 'Discover how near-infrared and red light therapy may support:',
        bodyCopy: '• Skin rejuvenation\n• Cellular energy\n• Recovery\n• Brain health\n• Healthy aging',
        buttonText: 'Get Instant Access',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-spa': {
      name: 'RedLightResearch - Light Deficiency',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'What If Aging Is Partly A Light Deficiency Problem?',
        subheadline: 'The science of photobiomodulation suggests certain wavelengths help support cellular energy, circulation, collagen, and mitochondrial function.',
        bodyCopy: 'Enter your email below and I\'ll send you my 23-page research-backed guide on red and near-infrared light therapy.',
        buttonText: 'Read The Research Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-ancestors': {
      name: 'RedLightResearch - Ancestors Light',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Your Ancestors Got Something Every Day You Barely Get At All',
        subheadline: 'Red and near-infrared light.',
        bodyCopy: 'Modern indoor living blocks many of the most biologically important wavelengths for cellular repair and recovery. Learn how photobiomodulation works in my free guide.',
        buttonText: 'Get The Free Guide',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-starving': {
      name: 'RedLightResearch - Starving For Light',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Modern World Is Starving Your Cells',
        subheadline: 'Most people are overexposed to artificial blue light… while being deprived of the healing red and near-infrared wavelengths human biology evolved with.',
        bodyCopy: 'Discover how specific wavelengths of light may support mitochondrial energy, skin repair, recovery, and healthy aging.',
        buttonText: 'Download The Free Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-industry-secret': {
      name: 'RedLightResearch - Industry Secret',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The Anti-Aging Industry Barely Talks About This',
        subheadline: 'Your mitochondria respond to light.',
        bodyCopy: 'Learn why researchers are studying red and near-infrared wavelengths for skin health, recovery, inflammation, and cognitive support.',
        buttonText: 'Download Free PDF',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-before-buy': {
      name: 'RedLightResearch - Before You Buy',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Before You Buy A Red Light Panel…',
        subheadline: 'Read this first.',
        bodyCopy: 'Most people don\'t understand wavelengths, penetration depth, irradiance, or why device quality matters. Get my free buyer\'s guide.',
        buttonText: 'Download Free Buyer\'s Guide',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-drowning': {
      name: 'RedLightResearch - Drowning In Frequencies',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'You\'re Drowning In Artificial Frequencies…',
        subheadline: '…but starving for regenerative light.',
        bodyCopy: 'Learn why specific wavelengths may be critical for recovery, energy, sleep, and healthy aging.',
        buttonText: 'Download The Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-wavelengths': {
      name: 'RedLightResearch - 9 Wavelengths',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'The 9 Most Important Light Wavelengths Explained',
        subheadline: 'A practical science-forward guide to photobiomodulation and wide-spectrum red light therapy.',
        bodyCopy: 'Includes 480nm, 590nm, 630nm, 660nm, 670nm, 810nm, 830nm, 850nm, and 1060nm.',
        buttonText: 'Send Me The PDF',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-missing-half': {
      name: 'RedLightResearch - Missing Half',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Most Red Light Panels Are Missing Half The Story',
        subheadline: 'Different wavelengths affect different tissues.',
        bodyCopy: 'Learn why wide-spectrum photobiomodulation may outperform basic 660nm/850nm-only systems.',
        buttonText: 'Get The Free Report',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'redlight-designed-outdoors': {
      name: 'RedLightResearch - Designed For Outdoors',
      tagId: '6942461446aba476ddd3ae8c',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'We Were Designed For Sunlight — Not Screens',
        subheadline: 'Artificial indoor living may be disrupting your biology in ways most people never consider.',
        bodyCopy: 'Discover the regenerative science of red and near-infrared light therapy.',
        buttonText: 'Get Instant Access',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['email']
    },
    'frequency-generator-report-2': {
      name: 'Frequency Generator Report 2',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'purple',
        layout: 'side-by-side',
        headline: 'Discover The Truth About "Rife Machines"',
        subheadline: 'Free Special Report Reveals Why These Devices May Do More Harm Than Good',
        bodyCopy: 'Enter your email below and I\'ll send you instant access to my investigative report exposing the frequency generator industry.',
        buttonText: 'Send Report To My Email!',
        image: { url: 'https://gcmodal.vercel.app/frequency-generator-book.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['firstName', 'email']
    },
    'frequency-generator-report-copy3': {
      name: 'Frequency Generator Report 3',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'purple',
        layout: 'side-by-side',
        headline: 'Discover The Truth About "Rife Machines"',
        subheadline: 'Free Special Report Reveals Why These Devices May Do More Harm Than Good',
        bodyCopy: 'Enter your email below and I\'ll send you instant access to my investigative report exposing the frequency generator industry.',
        buttonText: 'Send Report To My Email!',
        image: { url: 'https://gcmodal.vercel.app/frequency-generator-book.jpg', position: 'left-side', scale: 100 }
      },
      fields: ['firstName', 'email']
    },
    'ApricotSeed ForbiddenFood Course': {
      name: 'ForbiddenFood Course',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'purple',
        layout: 'side-by-side',
        headline: 'Could This Be The Missing Link in Human Nutrition?',
        subheadline: 'Is a hidden seed the missing vitamin secret that pharma has been hiding from you for decades?  ',
        bodyCopy: 'Learn more in my free reports & online course',
        buttonText: 'Send Report & Login To My Email',
        image: { url: 'https://images.convertbox.com/users/4727/1186d10060e54928f45dcf173d663b41.jpg', position: 'left-side', scale: 200 }
      },
      fields: ['firstName', 'email']
    },
    'Nitriloside ForbiddenFood Course': {
      name: 'ForbiddenFood Course NitrilosideImage',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Could This Be The Missing Link in Human Nutrition?',
        subheadline: 'Is a hidden seed the missing vitamin secret that pharma has been hiding from you for decades?  ',
        bodyCopy: 'Learn more in my free reports & online course',
        buttonText: 'Send Report & Login To My Email',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/Nitriloside-Research-Reports-lp-1-rGkLAOlTdGSpcOXEgdA0jf3SBD5pQZ.png', position: 'left-side', scale: 200 }
      },
      fields: ['firstName', 'email']
    },
    'Test Apricot': {
      name: 'Test Apricot',
      tagId: '69a02963430175cb1007f09d',
      design: {
        variant: 'green',
        layout: 'side-by-side',
        headline: 'Eat Apricot Seeds',
        subheadline: 'Free Report',
        bodyCopy: '',
        buttonText: 'Send it Now',
        image: { url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/apricot-pit-Y09baObgVQAoPdQLAeiwYpeuqWZpde.jpg', position: 'left-side', scale: 200 }
      },
      fields: ['firstName', 'email']
    }
  };

  return staticPopups;
}

/**
 * Get split test by ID
 */
async function getSplitTest(testId) {
  try {
    if (!CONTROLBOARD_TOKEN) return null;

    const response = await fetch('https://control.clawlauncher.io/api/settings', {
      headers: {
        'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
        'X-Workspace-Id': WORKSPACE_ID
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const settings = data.settings || {};
    const key = `split_test_${testId}`;
    
    if (settings[key]) {
      return typeof settings[key] === 'string' ? JSON.parse(settings[key]) : settings[key];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting split test:', error);
    return null;
  }
}

/**
 * GET /api/popups/[popupId]
 * Returns popup config, handling both regular popups and split tests
 */
export async function GET(req, { params }) {
  try {
    const { popupId } = params;

    // Check if this is a split test
    if (popupId.startsWith('split-')) {
      const test = await getSplitTest(popupId);
      
      if (!test) {
        return Response.json(
          { success: false, error: 'Split test not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }

      // If test is completed, return winner popup
      if (test.status === 'completed' && test.winnerPopupId) {
        const staticPopups = getStaticPopups();
        const winnerPopup = staticPopups[test.winnerPopupId];
        
        if (!winnerPopup) {
          return Response.json(
            { success: false, error: 'Winner popup not found' },
            { status: 404, headers: getSecurityHeaders() }
          );
        }

        // Return winner without sensitive data
        const { tagId, ...publicPopup } = winnerPopup;
        
        return Response.json(
          {
            success: true,
            popup: publicPopup,
            _splitTest: {
              testId: test.testId,
              isCompleted: true,
              winner: test.winnerPopupId
            }
          },
          { headers: getSecurityHeaders() }
        );
      }

      // Random 50/50 assignment
      const variant = Math.random() < 0.5 ? 'A' : 'B';
      const variantData = variant === 'A' ? test.variantA : test.variantB;
      
      // Get the actual popup config
      const staticPopups = getStaticPopups();
      const popupConfig = staticPopups[variantData.popupId];
      
      if (!popupConfig) {
        return Response.json(
          { success: false, error: 'Popup not found' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }

      // Return popup without sensitive data, with split test metadata
      const { tagId, ...publicPopup } = popupConfig;
      
      return Response.json(
        {
          success: true,
          popup: publicPopup,
          _splitTest: {
            testId: test.testId,
            variant: variant,
            isCompleted: false
          }
        },
        { headers: getSecurityHeaders() }
      );
    }

    // Regular popup
    const staticPopups = getStaticPopups();
    const popup = staticPopups[popupId];
    
    if (!popup) {
      return Response.json(
        { success: false, error: 'Popup not found' },
        { status: 404, headers: getSecurityHeaders() }
      );
    }

    // Return without sensitive data
    const { tagId, ...publicPopup } = popup;
    
    return Response.json(
      { success: true, popup: publicPopup },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('GET popup error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
