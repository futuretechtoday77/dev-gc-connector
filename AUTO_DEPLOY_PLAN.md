# MV Popup Manager - Automatic Deployment System

## Overview

This document outlines the automatic deployment system implemented for the MV Popup Manager. The system eliminates the need for manual git commits when creating or cloning popups by using **dynamic loading from Control Board** (Option A).

## Problem Statement

**Before:**
- Creating a new popup required saving to Control Board AND manually updating static config files
- Each popup change required a git commit and deployment
- Static configurations were duplicated across multiple files (`route.js`, `split-test/route.js`, `lib/popups.js`, `admin/popups/route.js`)

**After:**
- Popups are saved to Control Board and immediately available
- No git commits required for popup CRUD operations
- Single source of truth: Control Board settings
- Static configs remain as fallback for legacy popups

## Architecture

### Option A: Dynamic Loading from Control Board (IMPLEMENTED)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin UI      │────▶│  Control Board   │────▶│   API Routes    │
│  (Create/Edit)  │     │  (Persistent DB) │     │ (Dynamic Load)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                   ┌─────────────────┐
                                                   │  Public Access  │
                                                   │  (No Deploy!)   │
                                                   └─────────────────┘
```

### How It Works

1. **Popup Creation/Update**: Admin UI saves popup config to Control Board via `popup_${id}` settings key
2. **Popup Retrieval**: API routes fetch from Control Board first, then fall back to static config
3. **No Deployment Needed**: Changes are live immediately since they're read from Control Board on each request

## Files Modified

### 1. `/app/api/popups/route.js` - PUBLIC API
**Changes:**
- Already had dynamic loading logic - verified working
- Returns popup config (with tagId for form submission)
- Merges dynamic popups over static popups (dynamic takes precedence)

### 2. `/app/api/split-test/route.js` - SPLIT TEST API
**Changes:**
- Added dynamic popup loading from Control Board
- Falls back to static config for legacy popups
- Now supports split tests with dynamically created popups

### 3. `/app/api/admin/popups/route.js` - ADMIN API
**Changes:**
- Already loads dynamic popups from Control Board
- Filters out deleted/inactive popups
- Returns full config including tagId for admin use

### 4. `/lib/popups.js` - SHARED UTILITY
**Changes:**
- Already loads dynamic popups from Control Board
- Used by form submission and other server-side operations

### 5. `/app/api/popups/save/route.js` - SAVE ENDPOINT
**Changes:**
- Saves to Control Board (already implemented)
- Returns success message indicating popup is live immediately
- No deployment trigger needed

## New Files Created

### `/lib/controlboard.js` - Control Board Client
Centralized Control Board API client for consistent:
- Authentication
- Error handling
- Settings fetching/saving
- Popup-specific operations

### `/app/api/popups/list/route.js` - List All Popups
Dedicated endpoint for listing all available popups (for admin dashboard, split test selection, etc.)

## Data Flow

### Creating a New Popup

```
1. Admin UI ──POST /api/popups/save──▶ Save to Control Board
                                      (popup_${id} setting)
                                          │
                                          ▼
2. User Request ──GET /api/popups?id=xxx──▶ API reads from Control Board
                                              │
                                              ▼
3. Response ◀── Returns popup config ───────┘
```

### Split Test with Dynamic Popups

```
1. Admin creates split test with popup IDs
2. Split test saved to Control Board (split_test_${id})
3. Public request to /api/split-test?id=split-xxx
4. API loads split test config from Control Board
5. API loads popup configs (dynamic or static)
6. Returns variant assignment + popup config
```

## Environment Variables

Required in `.env.local` and Vercel:

```bash
# Control Board API
CONTROLBOARD_API_TOKEN=your_token_here
WORKSPACE_ID=674e44e4a85f45d1b44c1a40
```

## Migration Guide

### For Existing Popups
No action needed. Existing static popups continue to work as fallback.

### For New Popups
1. Create popup in Admin UI
2. Popup is immediately live - no deployment needed!

### Gradual Migration (Optional)
To migrate a static popup to dynamic:
1. Load popup in Admin UI
2. Save it (will create Control Board entry)
3. Remove from static config files (cleanup)

## Testing

### Verify Dynamic Loading
```bash
# 1. Create a test popup via Admin UI
# 2. Test public API
curl "https://gcmodal-api.vercel.app/api/popups?id=your-test-popup"

# 3. Should return popup config immediately (no deploy needed!)
```

### Verify Split Tests
```bash
# Test split test with dynamic popup
curl "https://gcmodal-api.vercel.app/api/split-test?id=split-your-test"
```

## Benefits

1. **No Deployment Delays**: Popups are live immediately
2. **No Git Noise**: No commits for popup changes
3. **Single Source of Truth**: Control Board stores all popup data
4. **Backward Compatible**: Static configs still work as fallback
5. **Scalable**: No code changes needed for new popups

## Future Enhancements (Optional)

### Option B: Git-based Auto-Commit (Not Implemented)
If git history is desired, could add:
- GitHub API integration to commit popup JSON files
- Vercel deploy hook trigger
- More complex, requires git credentials

### Option C: Hybrid with Caching (Not Implemented)
- Cache Control Board responses in Redis/Vercel KV
- Reduce API calls to Control Board
- Background refresh

## Rollback Plan

If issues arise:
1. Static configs are still in code as fallback
2. Can disable dynamic loading by commenting out Control Board fetch
3. Revert to previous git commit if needed

## Summary

The automatic deployment system is now **LIVE**. Creating, editing, or cloning popups in the Admin UI will make them immediately available without any git commits or deployments. The system uses Control Board as the single source of truth while maintaining backward compatibility with existing static configurations.
