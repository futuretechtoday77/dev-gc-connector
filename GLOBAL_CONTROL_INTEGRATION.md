# Global Control API Integration

**Last Updated:** 2026-06-04

## Overview

The dev-gc-connector now integrates directly with the Global Control CRM API to fire tags when forms are submitted. This ensures contacts are properly tagged for workflows.

## API Endpoint for Tag Firing

```
POST https://api.globalcontrol.io/api/ai/tags/fire-tag/{tagId}
```

**Headers:**
- `Content-Type: application/json`
- `X-API-KEY: {GLOBAL_CONTROL_API_KEY}`

**Body:**
```json
{
  "email": "contact@example.com"
}
```

**Important:** Use `email` field, NOT `contactId`.

## Implementation in Submit Route

File: `app/api/submit/route.js`

The submit handler now:
1. Creates contact via `gcmodal-api77`
2. Fires the associated tag via Global Control API
3. Returns success even if tagging fails (logs error)

```javascript
// Step 1: Create contact
const gcResponse = await fetch('https://gcmodal-api77.vercel.app/api/submit', {...});

// Step 2: Fire tag (if popup has tagId)
if (popup.tagId) {
  const tagResponse = await fetch(
    `https://api.globalcontrol.io/api/ai/tags/fire-tag/${popup.tagId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.GLOBAL_CONTROL_API_KEY
      },
      body: JSON.stringify({ email })
    }
  );
}
```

## Configured Popups with Tags

| Popup ID | Tag ID | Purpose |
|----------|--------|---------|
| `Consultation Rife1` | `690e80748ec2830ebfefdae0` | Consultation request workflow |

## Environment Variables

Add to Vercel:
```bash
vercel env add GLOBAL_CONTROL_API_KEY
```

## Testing Tag Firing

```bash
curl -X POST https://dev-gc-connector.vercel.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "popupId": "Consultation Rife1",
    "email": "test@example.com",
    "firstName": "Test",
    "phone": "555-1234"
  }'
```

## Troubleshooting

**Tag not firing?**
1. Check Vercel logs for "Tag fired successfully" or "Tag firing failed"
2. Verify `GLOBAL_CONTROL_API_KEY` is set in Vercel dashboard
3. Test Global Control API directly:
   ```bash
   curl -X POST https://api.globalcontrol.io/api/ai/tags/fire-tag/690e80748ec2830ebfefdae0 \
     -H "X-API-KEY: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

**Contact created but not tagged?**
- Check that popup config has `tagId` property
- Verify tag exists in Global Control
- Check API key permissions

## Related Skills

- `global-control-crm` — Full Global Control API skill with 73 commands
- `gc-connector-dev` — This connector (popup management + tag firing)
