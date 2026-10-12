# Security

## What this site is
A static website: HTML, CSS, JavaScript and images, served by GitHub Pages. It has
**no server code, no database, no login and no admin panel**, so there is nothing for
SQL injection, server-side code execution or password attacks to target.

## Protections in the code
| Risk | Protection |
|---|---|
| SQL / NoSQL injection | No database and no backend. Form data never leaves the visitor's browser except as a WhatsApp message they send themselves. |
| Cross-site scripting (XSS) | The script never inserts HTML (`innerHTML`, `insertAdjacentHTML` and `document.write` are not used). All text is written with `textContent`, so typed input such as `<script>` shows up as plain text. |
| Injected or third-party scripts | A Content-Security-Policy allows scripts **only** from this site (`script-src 'self'`). Inline scripts, inline styles, `eval`, plugins and frames are blocked. |
| Data theft | `connect-src 'none'` stops the page from sending data anywhere. `form-action 'none'` stops the form from posting to any server. |
| Link tampering (tabnabbing) | Every external link uses `rel="noopener noreferrer"`. |
| Leaking page addresses | `Referrer-Policy: strict-origin-when-cross-origin`. |
| Bad input | Inputs have length limits, control characters are stripped, the phone number and date are format-checked, and visit types and sessions must match the fixed lists. |
| Mixed content | `upgrade-insecure-requests`; turn on **Enforce HTTPS** in Settings → Pages. |
| Stored personal data | None. The only browser storage is the vaccine planner's date of birth, kept in the visitor's own browser. |

## Server headers (Vercel)
`vercel.json` adds HTTP security headers when the site is hosted on Vercel:
`Content-Security-Policy` (including `frame-ancestors 'none'`), `Strict-Transport-Security`,
`X-Frame-Options: DENY` (blocks clickjacking), `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, `Permissions-Policy` (camera, microphone, location and payment off),
and cross-origin isolation headers. GitHub Pages ignores this file, so on GitHub Pages only
the in-page policy applies.

## The biggest real risk: the GitHub account
Anyone who controls the GitHub account can change the site. To protect it:
1. Turn on two-factor authentication: GitHub → Settings → Password and authentication.
2. Protect `main`: Settings → Branches → add a rule requiring pull requests.
3. Only give write access to people who need it, and review third-party app access regularly.

## Reporting a problem
Contact the clinic on +91 87544 42145, or open a private security advisory on this repository.
