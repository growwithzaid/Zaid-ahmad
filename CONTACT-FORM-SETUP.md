# Contact form setup (free)

The form is intentionally disabled until a web-app endpoint is deployed. It will not claim to send messages before that setup is complete.

1. In the Google account you want to own enquiries, create a blank spreadsheet named `Portfolio enquiries`.
2. Copy its spreadsheet ID from the URL between `/d/` and `/edit`.
3. Open **Extensions → Apps Script**, replace the starter code with `apps-script/Code.gs`, and save.
4. In Apps Script **Project Settings → Script properties**, add `SHEET_ID` with the copied ID. Save.
5. Choose **Deploy → New deployment → Web app**. Set “Execute as” to your account and choose the access setting that permits site visitors to submit. Google may ask you to review access. Deploy and copy the web-app URL ending in `/exec`.
6. Put that URL in `assets/config.js` as the value of `appsScriptEndpoint`.
7. Build and deploy the site, then submit one clearly marked test enquiry. Confirm a corresponding new row appears in the spreadsheet. Delete that test row yourself if you do not want to keep it.

The sheet will contain visitors’ names, email addresses, subjects, messages, timestamps, and duplicate-protection IDs. Restrict spreadsheet sharing to yourself and handle submissions as private contact data. The static website contains no password or API secret. The Apps Script uses a script property for the spreadsheet ID and validates fields server-side.

The current frontend expects a JSON response from the Apps Script endpoint. If the browser blocks the response because of Apps Script cross-origin behavior, the form will show a delivery error and direct the visitor to email instead; test with a real row before considering the integration active.
