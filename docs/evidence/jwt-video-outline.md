# Screen-share outline (3–5 minutes)

Record this walkthrough yourself after configuring a working sign-in provider.
Keep secrets, passwords and cookie values off screen.

- 0:00–0:45: Explain database sessions (opaque cookie plus session-table lookup)
  versus encrypted JWT sessions (validated cookie with claims). Discuss revocation.
- 0:45–1:30: Show `lib/auth.ts`: JWT strategy, one-hour lifetime, environment
  secret validation and the explicit HttpOnly/Secure/SameSite=Lax cookie.
- 1:30–2:15: Show the JWT and session callbacks. Explain sub/provider/name/email,
  library timestamps, and why passwords, OAuth tokens and permission claims are absent.
- 2:15–3:15: Sign in, open `/dashboard/session`, and show the Server Component's
  `getServerSession(authOptions)` and `session.user.email`. Show session JSON without
  token values. Sign out and demonstrate the login redirect.
- 3:15–4:15: Explain rolling expiry, server reads versus writable session requests,
  expired-token rejection, secret rotation and the limitation of sign-out revocation.
  Show passing verification output.

Upload the recording to Google Drive, set “Anyone with the link can view”, and
test the sharing link in a private browser tab. Submit that link with the PR URL.
This outline is not a recording or proof that recording/upload has been completed.
