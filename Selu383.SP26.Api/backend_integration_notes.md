## Backend fix
- SeedHelper.cs
  - added fix for re-seeding on every server restart, removes the duplicates being created- before our database kept getting repeated spam locations getting created
  - removed all the duplicate spam locations and left in three locations for testing

## Web frontend
- vite.config.ts: dev proxy so /api/* calls from Vite go to the ASP.NET backend at :7116
- src/api.ts: typed fetch-based API calls for all backend endpoints (/api/authentication, /api/locations
- src/AuthContext.tsx: react context that tracks logged-in user, loads it from /api/authentication
- src/Login.tsx: mantine modal with user/pass form, calls API on submit
- src/Stores.tsx: page that fetches locations from /api/locations and displays in cards (basically a test to make sure new db is working)
- src/App.tsx: wrapped app in AuthProvider, added /stores route
- src/NavBar.tsx: added stores tab, sign in button, and user menu with sign out

## Mobile frontend
- api/client.ts: same typed API client for react native (no new libraries needed), has comment at the top for adjusting api base url for emulator. i don't know how the android emulation stuff works and i don't want to (lol)
- api/pages/login.tsx: did the todo! now uses real apiClient.auth.login() and redirects to home on success
- api/pages/stores.tsx: something to get and display locations from backend. also a test.

galkadi/Password123! should work as admin
bob/Password123! should work as a user
sue/Password123! should also work as a user

## Ok whatever what's actually changed
- initial backend connection stuff works.
- on the site, /stores now pulls locations straight from our azure SQL db instead of everything across the app just being hard-coded into the ui
- figuring out an approach for the admin panel and user rewards system should be much easier now but i'm too lazy to figure out naming schemas and migrations for that tonight

## TLDR
easiest way to manage the data in our azure SQL database is via swagger- with API running, check it at https://localhost:7116/swagger
first run a login
- under Authentication, POST /api/authentication/login - click Try It Out and replace username and password with galkadi and Password123!
- execute
- you're logged in as an admin now (as long as the IP whitelist is working) and this instance of swagger is connected to our azure SQL database. do not break anything because i have not backed anything up
