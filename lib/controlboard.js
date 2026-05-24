/**
 * Control Board API Client
 * Centralized client for Control Board operations
 * v1.0.0 - For MV Popup Manager auto-deployment
 */

const CONTROLBOARD_BASE_URL = 'https://control.clawlauncher.io/api';

/**
 * Get Control Board credentials from environment
 */
function getCredentials() {
  const token = process.env.CONTROLBOARD_API_TOKEN;
  const workspaceId = process.env.WORKSPACE_ID || '674e44e4a85f45d1b44c1a40';
  
  if (!token) {
    throw new Error('CONTROLBOARD_API_TOKEN not configured');
  }
  
  return { token, workspaceId };
}

/**
 * Get default headers for Control Board API requests
 */
function getHeaders(token, workspaceId) {
  return {
    'Authorization': `Bearer ${token}`,
    'X-Workspace-Id': workspaceId,
    'Content-Type': 'application/json'
  };
}

/**
 * Fetch all settings from Control Board
 * @returns {Promise<Object>} Settings object
 */
export async function fetchSettings() {
  try {
    const { token, workspaceId } = getCredentials();
    
    const response = await fetch(`${CONTROLBOARD_BASE_URL}/settings`, {
      headers: getHeaders(token, workspaceId)
    });
    
    if (!response.ok) {
      throw new Error(`Control Board error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.settings || {};
  } catch (error) {
    console.warn('⚠️ Control Board fetch failed:', error.message);
    return {};
  }
}

/**
 * Save a setting to Control Board
 * @param {string} key - Setting key
 * @param {any} value - Setting value (will be JSON stringified)
 * @returns {Promise<boolean>} Success status
 */
export async function saveSetting(key, value) {
  try {
    const { token, workspaceId } = getCredentials();
    
    const response = await fetch(`${CONTROLBOARD_BASE_URL}/settings`, {
      method: 'POST',
      headers: getHeaders(token, workspaceId),
      body: JSON.stringify({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Save failed: ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Control Board save failed:', error.message);
    throw error;
  }
}

/**
 * Fetch all popups from Control Board
 * @returns {Promise<Object>} Object with popupId as key and config as value
 */
export async function fetchDynamicPopups() {
  try {
    const settings = await fetchSettings();
    const popups = {};
    const deletedPopups = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (key.startsWith('popup_')) {
        try {
          const popupData = typeof value === 'string' ? JSON.parse(value) : value;
          
          // Skip deleted/inactive popups
          if (popupData?._inactive === true || popupData?.isActive === false) {
            const popupId = key.replace('popup_', '');
            deletedPopups.push(popupId);
          } else if (popupData?.popupId && popupData?.config) {
            popups[popupData.popupId] = popupData.config;
          }
        } catch (e) {
          console.warn('⚠️ Could not parse popup setting:', key);
        }
      }
    });
    
    return { popups, deletedPopups };
  } catch (error) {
    console.warn('⚠️ Could not fetch dynamic popups:', error.message);
    return { popups: {}, deletedPopups: [] };
  }
}

/**
 * Fetch a single popup from Control Board
 * @param {string} popupId - Popup ID
 * @returns {Promise<Object|null>} Popup config or null
 */
export async function fetchDynamicPopup(popupId) {
  try {
    const settings = await fetchSettings();
    const key = `popup_${popupId}`;
    const value = settings[key];
    
    if (!value) return null;
    
    const popupData = typeof value === 'string' ? JSON.parse(value) : value;
    
    // Skip deleted/inactive popups
    if (popupData?._inactive === true || popupData?.isActive === false) {
      return null;
    }
    
    return popupData.config || null;
  } catch (error) {
    console.warn(`⚠️ Could not fetch popup ${popupId}:`, error.message);
    return null;
  }
}

/**
 * Save a popup to Control Board
 * @param {string} popupId - Popup ID
 * @param {Object} config - Popup configuration
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} Success status
 */
export async function savePopup(popupId, config, options = {}) {
  const payload = {
    popupId,
    config,
    isActive: options.isActive !== false,
    updatedAt: new Date().toISOString(),
    ...options
  };
  
  return saveSetting(`popup_${popupId}`, payload);
}

/**
 * Mark a popup as deleted (soft delete)
 * @param {string} popupId - Popup ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePopup(popupId) {
  try {
    const existing = await fetchDynamicPopup(popupId);
    if (!existing) {
      console.warn(`⚠️ Popup ${popupId} not found for deletion`);
      return false;
    }
    
    return saveSetting(`popup_${popupId}`, {
      popupId,
      config: existing,
      _inactive: true,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Failed to delete popup ${popupId}:`, error.message);
    throw error;
  }
}

/**
 * Fetch split test configuration
 * @param {string} testId - Split test ID (with or without 'split-' prefix)
 * @returns {Promise<Object|null>} Split test config or null
 */
export async function fetchSplitTest(testId) {
  try {
    const settings = await fetchSettings();
    const normalizedId = testId.startsWith('split-') ? testId : `split-${testId}`;
    const key = `split_test_${normalizedId}`;
    const value = settings[key];
    
    if (!value) return null;
    
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    console.warn(`⚠️ Could not fetch split test ${testId}:`, error.message);
    return null;
  }
}

/**
 * Save split test configuration
 * @param {string} testId - Split test ID
 * @param {Object} testConfig - Split test configuration
 * @returns {Promise<boolean>} Success status
 */
export async function saveSplitTest(testId, testConfig) {
  const normalizedId = testId.startsWith('split-') ? testId : `split-${testId}`;
  const payload = {
    testId: normalizedId,
    ...testConfig,
    updatedAt: new Date().toISOString()
  };
  
  return saveSetting(`split_test_${normalizedId}`, payload);
}

/**
 * Check if Control Board is configured and accessible
 * @returns {Promise<boolean>} Availability status
 */
export async function isControlBoardAvailable() {
  try {
    const settings = await fetchSettings();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get all active popup IDs from Control Board
 * @returns {Promise<string[]>} Array of popup IDs
 */
export async function getActivePopupIds() {
  const { popups } = await fetchDynamicPopups();
  return Object.keys(popups);
}

/**
 * Merge dynamic popups with static popups
 * Dynamic popups take precedence over static ones
 * @param {Object} staticPopups - Static popup configurations
 * @returns {Promise<Object>} Merged popup configurations
 */
export async function mergePopups(staticPopups = {}) {
  const { popups: dynamicPopups, deletedPopups } = await fetchDynamicPopups();
  
  // Filter out deleted popups from static list
  const filteredStatic = {};
  Object.entries(staticPopups).forEach(([key, value]) => {
    if (!deletedPopups.includes(key)) {
      filteredStatic[key] = value;
    }
  });
  
  // Merge: dynamic takes precedence
  return { ...filteredStatic, ...dynamicPopups };
}
