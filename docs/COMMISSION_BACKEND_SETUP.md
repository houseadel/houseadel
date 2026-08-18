# House Adel inquiry backend setup

This setup uses one standalone Google Apps Script project. The script creates the private Google Form and linked response Sheet, then acts as the public Web App receiver for the custom House Adel form.

The Google Form is storage infrastructure. Visitors continue to see only the House Adel website.

## Before you begin

You need:

- a Google account that can create Google Forms, Sheets, and Apps Script Web Apps;
- access to the House Adel repository;
- the complete script in `google-apps-script/Code.gs`.

The Web App URL is public routing information. It is not a password and it grants no access to edit the Form or Sheet. Never place Google passwords, OAuth tokens, service-account files, or Drive credentials in the website.

## 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com/).
2. Click **New project**.
3. At the top, rename the project to **House Adel Commission Backend**.
4. Open the default `Code.gs` file.
5. Delete all default code in that file.
6. In this repository, open `google-apps-script/Code.gs`.
7. Copy the entire file and paste it into the empty Apps Script editor.
8. Click **Save project**.

## 2. Create the Google Form and linked Sheet

1. In the function selector at the top of Apps Script, choose `setupHouseAdelCommissionBackend`.
2. Click **Run**.
3. Google will ask for permission. Click **Review permissions**.
4. Choose the Google account that should own the Form and Sheet.
5. Approve access to Google Forms and Google Sheets.
6. Wait until the execution says **Execution completed**.
7. At the bottom of the editor, open **Execution log**.

The log contains:

- Form edit URL;
- Form responder URL;
- Form ID;
- linked spreadsheet URL;
- spreadsheet ID;
- every Form item title, ID, and type.

Open the Form edit URL and the spreadsheet URL once. Confirm that the Form contains 13 questions and the Sheet is linked as its response destination.

Running setup again is safe. The script stores the Form and Sheet IDs in Script Properties and reopens the existing files. It does not create a second pair. If a deliberate replacement is needed later, run `recreateHouseAdelCommissionBackend`. That function detaches the old IDs but does not delete the old Form or Sheet.

### If you already created the former 25-question development Form

Do not run the recreate function. Select `migrateHouseAdelCommissionBackendToSimpleSchema` and click **Run** once. The migration renames the former Form and Sheet with an `archived` suffix, logs their IDs and URLs, and creates one new active 13-question pair. It deletes neither file. Running the migration again is safe and does not create another pair.

## 3. Make one backend-only test response

1. In the Apps Script function selector, choose `testHouseAdelCommissionSubmission`.
2. Click **Run**.
3. Open the linked response Sheet.
4. Confirm a new row named **House Adel test** appears.
5. Check that the row includes Submission ID, Contact, planning, website purpose, project meaning, More details, Reference links, Submitted at, Source, and Frontend version.

This row is deliberately labelled as a test. Delete it after verification if desired.

## 4. Deploy the Apps Script as a Web App

1. In Apps Script, click **Deploy**.
2. Click **New deployment**.
3. Next to **Select type**, click the gear icon.
4. Choose **Web app**.
5. Enter a description such as `House Adel inquiry receiver v2`.
6. For **Execute as**, choose **Me**.
7. For **Who has access**, choose **Anyone**.
8. Click **Deploy**.
9. Approve permissions again if Google asks.
10. Copy the Web App URL. Use the production URL ending in `/exec`, not the development URL ending in `/dev`.

If **Anyone** is not available, the Google Workspace administrator has disabled anonymous Web Apps. Use an account where anonymous deployment is allowed or ask the administrator to permit it. A public GitHub Pages form cannot submit to a Web App that requires every visitor to sign in.

## 5. Connect the House Adel website

1. Open `src/config/commissionBackend.ts`.
2. Find:

   ```ts
   appsScriptEndpointUrl: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
   ```

3. Replace only the placeholder text with the copied `/exec` URL.
4. Keep `frontendVersion` as `commission-form-v3` for this release.
5. Keep `source` as `houseadel.com`.
6. Save the file.

No Form ID, Sheet ID, item ID, password, API key, or OAuth credential belongs in frontend code.

## 6. Test the complete website flow locally

1. In this repository, run `npm install` if dependencies are not installed.
2. Run `npm run dev`.
3. Open the local URL shown by Vite, then visit `/contact`.
4. Submit a clearly labelled fake inquiry such as:

   - Your name: `Website end-to-end test`
   - Contact: your own email address
   - What are you planning: `House Adel inquiry system test`
   - Website purpose: `Confirm the static website reaches Apps Script`
   - Project material: `This is a test response and may be deleted`

5. Add an optional date.
6. Open **Add more details** and enter a short note in the single optional **Tell us more** field.
7. Click **Submit enquiry** once.
8. Confirm the website shows the received state.
9. Open the linked response Sheet and verify exactly one new row appears with the same inquiry ID shown in the inline confirmation state.
10. Verify all entered optional values appear under their matching columns.

If the website shows an error, the entered answers remain in the form. Open the browser console and the Apps Script **Executions** page before trying again. The frontend first requests a readable JSON response. If a browser blocks that cross-origin response, it uses an opaque `no-cors` delivery only together with a separate status check for the same inquiry ID. It never treats the opaque response alone as proof that Google accepted the inquiry.

## 7. Deploy the static site to GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. It runs the production build, creates a GitHub Pages history fallback, uploads only `dist`, and deploys the static artifact.

1. Push the configured code to the `main` branch.
2. In GitHub, open **Settings**, then **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy House Adel to GitHub Pages** to finish.
5. Open the deployed `/contact` route directly in a new private browser window.
6. Repeat the fake submission and confirm exactly one new Sheet row appears.

## Updating the Apps Script later

After changing `Code.gs`:

1. Save the script.
2. Click **Deploy**, then **Manage deployments**.
3. Edit the existing Web App deployment.
4. Choose **New version**.
5. Click **Deploy**.

The `/exec` URL normally remains the same when the existing deployment is updated. If Google gives a new URL, update only `src/config/commissionBackend.ts` and redeploy the static site.

## What the protection does and does not do

The system validates required fields in the browser and again in Apps Script. It includes a honeypot, rejects implausibly fast submissions, normalizes control characters, limits answer length, prevents spreadsheet-formula prefixes, locks concurrent writes, and remembers recent inquiry IDs to suppress duplicate rows.

The inquiry ID and hidden metadata are not secrets. They help organize and diagnose responses. They do not authenticate a visitor. The endpoint remains public because the public static form must reach it.
