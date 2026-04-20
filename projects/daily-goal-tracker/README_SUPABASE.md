# Daily Goal Tracker - Supabase Build

This package contains the frontend updated to use Supabase instead of Google Apps Script.

## Included updates
- Supabase config in `config.js`
- Browser client in `supabase-client.js`
- Supabase auth guard in `auth-guard.js`
- Rewritten shared data layer in `storage.js`
- Updated login/admin/dashboard/report pages to load Supabase
- Existing UI and styling preserved

## Before running
Your Supabase project should already have:
- `tasks`
- `daily_status`
- `activity_log`
- Row Level Security policies
- Your user account in Supabase Auth
- 88 seeded tasks in `tasks`

## Files to deploy
Upload the contents of this folder to your static host (Netlify, Vercel static, GitHub Pages with a suitable setup, or local web server).

## Login
Use the same email and password you created in Supabase Authentication.

## Notes
- The app keeps unsaved checkbox draft state in browser local storage.
- Press **Submit Today** to save the current day's checklist to Supabase.
- Reports are generated from `daily_status` and `activity_log`.
