/**
 * Portfolio enquiry receiver. Create a spreadsheet, open Extensions > Apps Script,
 * paste this file, set SHEET_ID in Project Settings > Script Properties, then deploy
 * as a web app executing as you and accessible to anyone.
 */
function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const sheetId = props.getProperty('SHEET_ID');
    if (!sheetId) throw new Error('SHEET_ID is not configured');
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const name = clean_(payload.name, 120);
    const email = clean_(payload.email, 254);
    const subject = clean_(payload.subject, 180);
    const message = clean_(payload.message, 5000);
    if (!name || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please provide valid form details');
    }
    const key = clean_(payload.submissionId, 80);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(['Received at', 'Name', 'Email', 'Subject', 'Message', 'Submission ID']);
      if (key && sheet.getLastRow() > 1) {
        const match = sheet.getRange(2, 6, sheet.getLastRow() - 1, 1).createTextFinder(key).matchEntireCell(true).findNext();
        if (match) return json_({ ok: true, duplicate: true });
      }
      sheet.appendRow([new Date(), safeCell_(name), safeCell_(email), safeCell_(subject), safeCell_(message), key]);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}
function doGet() { return json_({ ok: true, service: 'portfolio-enquiries' }); }
function clean_(value, max) { return String(value || '').trim().slice(0, max); }
function safeCell_(value) { return /^[=+@\-]/.test(value) ? "'" + value : value; }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
