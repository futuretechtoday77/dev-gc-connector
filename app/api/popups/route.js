/**
 * Get Popup Configurations
 * Loads from Control Board (for dynamic updates) + static config (fallback)
 * v2.8.8 - All folder popups included
 */

import { getSecurityHeaders, mergeHeaders } from '@/lib/security-headers';

export async function GET(req) {
  // Check for single popup request via query param
  const { searchParams } = new URL(req.url);
  const popupId = searchParams.get('id');

  // Static popup configurations - ALL POPUPS FROM FOLDERS
  const staticPopups = {
    // ==================== APRICOT SEED FOLDER (tag: 69a02963430175cb1007f09d) ====================
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

    'ApricotSeed ForbiddenFood Course': {
      name: 'ApricotSeed ForbiddenFood Course',
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

    'Nitriloside ForbiddenFood Course': {
      name: 'ForbiddenFood Course NitrilosideImage',
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-apricots-E3EBcacdDYLhQ4uosbGgxj9FfRUbQK.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v1-aQPLZkMFZbz6v84kH1awkTKaXGG2UG.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v2-sb1SNKQzrmazn0qmvgNrruePKXNKD4.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v3-aUryyixguVDJoanjoS95dxU1wG2YiK.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v4-A4kaGUaikmgQkYkUbP5rOPBq23fz2f.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-forbiddenfood-research-v5-HqLkto19oKCVgqFzDKvU9yAV7WuKvm.jpg',
          position: 'left-side',
          scale: 100
        }
      },
      fields: ['email']
    },

    'forbiddenfood-nitriloside': {
      name: 'ForbiddenFood Course Nitriloside',
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

    'nitriloside-course': {
      name: 'Nitriloside Course',
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

    // ==================== RED LIGHT FOLDER (tag: 6942461446aba476ddd3ae8c) ====================
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-athlete-l0nzaaJ22wiJ88KBFE7HY3YBtW2RLk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-redlight-spa-qgQPRDwIthYG7xdiCGNdoqMJJxMFlE.jpg',
          position: 'left-side',
          scale: 100
        }
      },
      fields: ['email']
    },

    // ==================== RIFE FOLDER (tag: 68cb4cbb97f1fa5d35ebf6f3) ====================
    'frequency-generator-report': {
      name: 'Frequency Generator Report',
      tagId: '68cb4cbb97f1fa5d35ebf6f3',
      design: {
        variant: 'blue',
        layout: 'side-by-side',
        headline: 'Cuts Thru The BS And Show & Get The Truth About So Called "Rife Machines"',
        subheadline: 'Where should I send your free Rife Reports?',
        bodyCopy: 'Enter your email below and I\'ll send you this and my most popular Rife Reports published over the last 20 years..',
        buttonText: 'Send Reports To My Email!',
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/CAFG-book-cover-Lh2xaPIH7sJdphdusZIbLNi3lGBiEM.png',
          position: 'left-side',
          scale: 145
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-scientist-bw-NyRzMRFVkQCIXmC4fQHvRLo5jvgfCk.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-scientist-sepia-xp2jRuxSBxMfExXAlnjUXFhOZngjYK.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-microscope-8VLoNzr2SKTfDf1yxSvgHS77dxAPzX.jpg',
          position: 'left-side',
          scale: 100
        }
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
        image: {
          url: 'https://wtlu1vtxxipjqznc.public.blob.vercel-storage.com/popup-rifelead-waveforms-zERaEow0nQ39298PxHPY8RoeDrKh1X.jpg',
          position: 'left-side',
          scale: 100
        }
      },
      fields: ['email']
    }
  };

  // Try to load dynamic popups from Control Board settings
  let dynamicPopups = {};

  try {
    const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN;
    const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40';

    if (CONTROLBOARD_TOKEN) {
      const response = await fetch('https://control.clawlauncher.io/api/settings', {
        headers: {
          'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
          'X-Workspace-Id': WORKSPACE_ID
        }
      });

      if (response.ok) {
        const data = await response.json();
        const settings = data.settings || {};

        // Extract popup configs from settings (keys starting with popup_)
        Object.entries(settings).forEach(([key, value]) => {
          if (key.startsWith('popup_')) {
            try {
              const popupData = typeof value === 'string' ? JSON.parse(value) : value;
              if (popupData?.popupId && popupData?.config && popupData?.isActive !== false) {
                dynamicPopups[popupData.popupId] = popupData.config;
              }
            } catch (e) {
              console.warn('⚠️ Could not parse popup setting:', key);
            }
          }
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not load dynamic popups:', error.message);
  }

  // Merge dynamic popups with static (dynamic takes precedence)
  const allPopups = { ...staticPopups, ...dynamicPopups };

  // Handle split test lookup
  if (popupId && popupId.startsWith('split-')) {
    try {
      const CONTROLBOARD_TOKEN = process.env.CONTROLBOARD_API_TOKEN;
      const WORKSPACE_ID = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40';

      if (CONTROLBOARD_TOKEN) {
        const response = await fetch('https://control.clawlauncher.io/api/settings', {
          headers: {
            'Authorization': `Bearer ${CONTROLBOARD_TOKEN}`,
            'X-Workspace-Id': WORKSPACE_ID
          }
        });

        if (response.ok) {
          const data = await response.json();
          const settings = data.settings || {};
          const key = `split_test_${popupId}`;

          if (settings[key]) {
            const test = typeof settings[key] === 'string' ? JSON.parse(settings[key]) : settings[key];

            if (test.status === 'completed' && test.winnerPopupId) {
              const popupConfig = allPopups[test.winnerPopupId];
              if (popupConfig) {
                const { tagId, ...publicPopup } = popupConfig;
                return Response.json({
                  success: true,
                  popup: publicPopup,
                  _splitTest: { testId: test.testId, variant: 'winner', isCompleted: true }
                }, { headers: mergeHeaders({
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, OPTIONS',
                  'Access-Control-Allow-Headers': 'Content-Type'
                  }, getSecurityHeaders()) });
              }
            }

            // Random assignment for running tests
            const variant = Math.random() < 0.5 ? 'A' : 'B';
            const variantData = variant === 'A' ? test.variantA : test.variantB;
            const popupConfig = allPopups[variantData.popupId];

            if (popupConfig) {
              const { tagId, ...publicPopup } = popupConfig;
              return Response.json({
                success: true,
                popup: publicPopup,
                _splitTest: { testId: test.testId, variant, isCompleted: false }
              }, { headers: mergeHeaders({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
                }, getSecurityHeaders()) });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching split test:', error);
      return Response.json(
        { success: false, error: 'Error fetching split test: ' + error.message },
        { status: 500, headers: mergeHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }, getSecurityHeaders()) }
      );
    }

    return Response.json(
      { success: false, error: 'Split test not found' },
      { status: 404, headers: mergeHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }, getSecurityHeaders()) }
    );
  }

  // Regular popup lookup
  const popup = allPopups[popupId];
  if (popup) {
    // Include tagId for form submission (it's needed by the submit API)
    return Response.json(
      { success: true, popup: popup },
      { headers: mergeHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }, getSecurityHeaders()) }
    );
  }

  return Response.json(
    { success: false, error: 'Popup not found' },
    { status: 404, headers: mergeHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }, getSecurityHeaders()) }
  );
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
