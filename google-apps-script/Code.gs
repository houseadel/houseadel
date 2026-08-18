/**
 * House Adel commission inquiry backend.
 *
 * Paste this entire file into a standalone project at script.google.com.
 * Run setupHouseAdelCommissionBackend() once, then deploy the project as a
 * Web App that executes as you and is accessible to anyone.
 */

const HOUSE_ADEL_FORM_TITLE = "House Adel — Commission Inquiry";
const HOUSE_ADEL_SHEET_TITLE = "House Adel — Commission Inquiry Responses";
const HOUSE_ADEL_CONFIRMATION =
  "Thank you. Your inquiry has reached House Adel. We will read through it personally and get back to you soon.";

const HOUSE_ADEL_PROPERTIES = Object.freeze({
  formId: "HOUSE_ADEL_FORM_ID",
  spreadsheetId: "HOUSE_ADEL_SPREADSHEET_ID",
  itemIds: "HOUSE_ADEL_ITEM_IDS_JSON",
  recentSubmissionIds: "HOUSE_ADEL_RECENT_SUBMISSION_IDS_JSON",
});

const HOUSE_ADEL_FIELDS = Object.freeze([
  { key: "submissionId", title: "Submission ID", type: "text", required: true },
  { key: "name", title: "Your name", type: "text", required: true },
  {
    key: "contact",
    title: "Contact",
    type: "text",
    required: true,
    help: "WhatsApp number, Instagram handle, email address, or another preferred contact.",
  },
  { key: "planning", title: "What are you planning?", type: "paragraph", required: true },
  { key: "eventDate", title: "When is it for?", type: "date", required: false },
  {
    key: "websitePurpose",
    title: "What should the website help people do?",
    type: "paragraph",
    required: true,
  },
  {
    key: "projectMeaning",
    title: "Tell us something that belongs to this project.",
    type: "paragraph",
    required: true,
    help:
      "It could be a place, a memory, an object, a photograph, a piece of music, a tradition, or something completely different.",
  },
  { key: "moreDetails", title: "More details", type: "paragraph", required: false },
  {
    key: "references",
    title: "Reference links",
    type: "paragraph",
    required: false,
    help: "Google Drive, Pinterest, Instagram, Figma, Are.na, Dropbox, websites, films, or other useful links.",
  },
  {
    key: "anythingElse",
    title: "Anything else we should know?",
    type: "paragraph",
    required: false,
  },
  { key: "submittedAt", title: "Submitted at", type: "text", required: true },
  { key: "source", title: "Source", type: "text", required: true },
  { key: "frontendVersion", title: "Frontend version", type: "text", required: false },
]);

const HOUSE_ADEL_REQUIRED_KEYS = Object.freeze([
  "submissionId",
  "name",
  "contact",
  "planning",
  "websitePurpose",
  "projectMeaning",
  "submittedAt",
  "source",
]);

const HOUSE_ADEL_LIMITS = Object.freeze({
  submissionId: 32,
  name: 160,
  contact: 254,
  eventDate: 10,
  source: 80,
  frontendVersion: 80,
  short: 240,
  paragraph: 4000,
});

/** Creates the Form and linked response Sheet once, then logs every identifier. */
function setupHouseAdelCommissionBackend() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const properties = PropertiesService.getScriptProperties();
    let form = openStoredForm_(properties);
    let spreadsheet = openStoredSpreadsheet_(properties);

    if (!form) {
      form = FormApp.create(HOUSE_ADEL_FORM_TITLE);
      properties.setProperty(HOUSE_ADEL_PROPERTIES.formId, form.getId());

      form
        .setConfirmationMessage(HOUSE_ADEL_CONFIRMATION)
        .setAcceptingResponses(true)
        .setShowLinkToRespondAgain(false)
        .setPublishingSummary(false)
        .setProgressBar(false)
        .setShuffleQuestions(false);

      HOUSE_ADEL_FIELDS.forEach(function (definition) {
        addFormItem_(form, definition);
      });
    } else {
      assertFormShape_(form);
    }

    if (!spreadsheet) {
      spreadsheet = SpreadsheetApp.create(HOUSE_ADEL_SHEET_TITLE);
      properties.setProperty(HOUSE_ADEL_PROPERTIES.spreadsheetId, spreadsheet.getId());
    }

    const currentDestinationId = getDestinationIdOrNull_(form);
    if (currentDestinationId !== spreadsheet.getId()) {
      form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
    }

    const itemIds = {};
    form.getItems().forEach(function (item) {
      itemIds[item.getTitle()] = String(item.getId());
    });
    properties.setProperty(HOUSE_ADEL_PROPERTIES.itemIds, JSON.stringify(itemIds));

    logBackendConfiguration_(form, spreadsheet);
    return {
      formId: form.getId(),
      formEditUrl: form.getEditUrl(),
      formResponderUrl: form.getPublishedUrl(),
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl(),
      itemIds: itemIds,
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Explicit migration from the former 25-question development schema to the
 * simplified inquiry. The old Form and Sheet are renamed and retained. Their
 * IDs are logged before a new pair becomes the active backend.
 *
 * Run this once if setup reports that the stored Form has the old shape.
 */
function migrateHouseAdelCommissionBackendToSimpleSchema() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const properties = PropertiesService.getScriptProperties();
    const form = openStoredForm_(properties);
    const spreadsheet = openStoredSpreadsheet_(properties);

    if (form && spreadsheet && formMatchesExpectedShape_(form)) {
      console.log("The simplified inquiry schema is already active. No migration was performed.");
    } else {
      const archiveDate = new Date().toISOString().slice(0, 10);
      if (form) {
        console.log("Archiving previous Form. ID: %s | Edit URL: %s", form.getId(), form.getEditUrl());
        form.setTitle(HOUSE_ADEL_FORM_TITLE + " — archived " + archiveDate);
      }
      if (spreadsheet) {
        console.log("Archiving previous response Sheet. ID: %s | URL: %s", spreadsheet.getId(), spreadsheet.getUrl());
        spreadsheet.rename(HOUSE_ADEL_SHEET_TITLE + " — archived " + archiveDate);
      }

      properties.deleteProperty(HOUSE_ADEL_PROPERTIES.formId);
      properties.deleteProperty(HOUSE_ADEL_PROPERTIES.spreadsheetId);
      properties.deleteProperty(HOUSE_ADEL_PROPERTIES.itemIds);
      properties.deleteProperty(HOUSE_ADEL_PROPERTIES.recentSubmissionIds);
    }
  } finally {
    lock.releaseLock();
  }

  return setupHouseAdelCommissionBackend();
}

/**
 * Explicitly starts a new Form and Sheet without deleting the old files.
 * Use only when a full replacement is intentional.
 */
function recreateHouseAdelCommissionBackend() {
  const properties = PropertiesService.getScriptProperties();
  const previous = properties.getProperties();
  console.log("Previous backend IDs are being detached, not deleted: %s", JSON.stringify(previous));
  properties.deleteProperty(HOUSE_ADEL_PROPERTIES.formId);
  properties.deleteProperty(HOUSE_ADEL_PROPERTIES.spreadsheetId);
  properties.deleteProperty(HOUSE_ADEL_PROPERTIES.itemIds);
  properties.deleteProperty(HOUSE_ADEL_PROPERTIES.recentSubmissionIds);
  return setupHouseAdelCommissionBackend();
}

/** A small health/status response. It exposes no Form, Sheet, or visitor content. */
function doGet(e) {
  const request = e && e.parameter ? e.parameter : {};
  if (request.action === "status") {
    const submissionId = cleanSingleLine_(request.submissionId, HOUSE_ADEL_LIMITS.submissionId);
    const prefix = cleanSingleLine_(request.prefix, 96);
    if (!/^HA-I-\d{4}-[A-Z0-9]{6,12}$/.test(submissionId)) {
      return jsonpOutput_(prefix, { ok: false, confirmed: false, error: "Invalid submission ID." });
    }
    const properties = PropertiesService.getScriptProperties();
    const confirmed = readRecentSubmissionIds_(properties).indexOf(submissionId) !== -1;
    return jsonpOutput_(prefix, { ok: true, confirmed: confirmed, submissionId: submissionId });
  }

  const configured = Boolean(PropertiesService.getScriptProperties().getProperty(HOUSE_ADEL_PROPERTIES.formId));
  return jsonOutput_({
    ok: true,
    service: "House Adel inquiry receiver",
    configured: configured,
  });
}

/** Receives a JSON or form-encoded submission from the static House Adel site. */
function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const result = processSubmission_(payload);
    return jsonOutput_(result);
  } catch (error) {
    console.error("House Adel inquiry rejected: %s", error && error.stack ? error.stack : error);
    return jsonOutput_({
      ok: false,
      error: safeErrorMessage_(error),
    });
  }
}

/** Creates one unmistakable test row without requiring the website. */
function testHouseAdelCommissionSubmission() {
  const now = new Date();
  const token = Utilities.getUuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  const result = processSubmission_({
    submissionId: "HA-I-" + now.getUTCFullYear() + "-" + token,
    name: "House Adel test",
    contact: "hello.houseofadel@gmail.com",
    planning: "A test inquiry created from Apps Script.",
    eventDate: "",
    websitePurpose: "Confirm that the Form and linked Sheet receive every mapped field.",
    projectMeaning: "This is a clearly labelled setup test and may be deleted after verification.",
    moreDetails: "A simple freeform detail for the new inquiry schema.",
    references: "https://houseadel.com",
    anythingElse: "Generated by testHouseAdelCommissionSubmission().",
    submittedAt: now.toISOString(),
    formStartedAt: new Date(now.getTime() - 10000).toISOString(),
    source: "houseadel.com",
    frontendVersion: "commission-form-v2-script-test",
    website: "",
  });
  console.log("Test submission result: %s", JSON.stringify(result));
  return result;
}

function processSubmission_(rawPayload) {
  const payload = validateAndSanitizePayload_(rawPayload);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const properties = PropertiesService.getScriptProperties();
    const form = openStoredForm_(properties);
    if (!form) {
      throw new Error("Backend setup has not been run yet.");
    }
    assertFormShape_(form);

    const recentIds = readRecentSubmissionIds_(properties);
    if (recentIds.indexOf(payload.submissionId) !== -1) {
      return { ok: true, submissionId: payload.submissionId, duplicate: true };
    }

    const itemByTitle = {};
    form.getItems().forEach(function (item) {
      itemByTitle[item.getTitle()] = item;
    });

    let response = form.createResponse();
    HOUSE_ADEL_FIELDS.forEach(function (definition) {
      const value = payload[definition.key];
      if (value === undefined || value === null || value === "") return;
      const item = itemByTitle[definition.title];
      if (!item) throw new Error("The Google Form is missing: " + definition.title);
      response = response.withItemResponse(createItemResponse_(item, definition, value));
    });
    response.submit();

    recentIds.push(payload.submissionId);
    properties.setProperty(
      HOUSE_ADEL_PROPERTIES.recentSubmissionIds,
      JSON.stringify(recentIds.slice(-250)),
    );

    return { ok: true, submissionId: payload.submissionId };
  } finally {
    lock.releaseLock();
  }
}

function addFormItem_(form, definition) {
  let item;
  if (definition.type === "paragraph") {
    item = form.addParagraphTextItem();
  } else if (definition.type === "date") {
    item = form.addDateItem().setIncludesYear(true);
  } else if (definition.type === "choice") {
    item = form.addMultipleChoiceItem().setChoiceValues(definition.choices);
  } else {
    item = form.addTextItem();
  }

  item.setTitle(definition.title).setRequired(Boolean(definition.required));
  if (definition.help) item.setHelpText(definition.help);
  return item;
}

function createItemResponse_(item, definition, value) {
  if (definition.type === "paragraph") {
    return item.asParagraphTextItem().createResponse(String(value));
  }
  if (definition.type === "date") {
    return item.asDateItem().createResponse(parseDateOnly_(String(value)));
  }
  if (definition.type === "choice") {
    return item.asMultipleChoiceItem().createResponse(String(value));
  }
  return item.asTextItem().createResponse(String(value));
}

function parsePayload_(e) {
  if (!e) throw new Error("No request body was received.");
  const contents = e.postData && typeof e.postData.contents === "string" ? e.postData.contents.trim() : "";
  if (contents) {
    try {
      return JSON.parse(contents);
    } catch (error) {
      if (!e.parameter || Object.keys(e.parameter).length === 0) {
        throw new Error("The request body is not valid JSON.");
      }
    }
  }
  return e.parameter || {};
}

function validateAndSanitizePayload_(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The submission payload is malformed.");
  }
  if (cleanSingleLine_(value.website, 200)) {
    throw new Error("The submission could not be accepted.");
  }

  const payload = {};
  HOUSE_ADEL_FIELDS.forEach(function (definition) {
    const limit = limitForField_(definition);
    payload[definition.key] = definition.type === "paragraph"
      ? cleanMultiline_(value[definition.key], limit)
      : cleanSingleLine_(value[definition.key], limit);
  });

  HOUSE_ADEL_REQUIRED_KEYS.forEach(function (key) {
    if (!payload[key]) throw new Error("A required field is missing: " + key + ".");
  });

  if (!/^HA-I-\d{4}-[A-Z0-9]{6,12}$/.test(payload.submissionId)) {
    throw new Error("The submission ID is invalid.");
  }
  const submittedAt = new Date(payload.submittedAt);
  if (Number.isNaN(submittedAt.getTime())) throw new Error("The submission time is invalid.");
  const now = Date.now();
  if (submittedAt.getTime() > now + 5 * 60 * 1000 || submittedAt.getTime() < now - 24 * 60 * 60 * 1000) {
    throw new Error("The submission time is outside the accepted window.");
  }
  if (String(submittedAt.getUTCFullYear()) !== payload.submissionId.slice(5, 9)) {
    throw new Error("The submission ID year does not match the submission time.");
  }
  if (payload.source !== "houseadel.com") throw new Error("The submission source is invalid.");
  if (payload.references) validateReferenceLinks_(payload.references);

  const startedAtValue = cleanSingleLine_(value.formStartedAt, 40);
  if (startedAtValue) {
    const startedAt = new Date(startedAtValue);
    if (Number.isNaN(startedAt.getTime())) throw new Error("The form start time is invalid.");
    if (submittedAt.getTime() - startedAt.getTime() < 2500) {
      throw new Error("The form was completed too quickly. Please try again.");
    }
  }

  if (payload.eventDate) parseDateOnly_(payload.eventDate);
  return payload;
}

function validateReferenceLinks_(value) {
  const links = String(value).split(/\s+/).filter(Boolean);
  const invalid = links.some(function (link) {
    return !/^https?:\/\/[^\s]+$/i.test(link);
  });
  if (invalid) throw new Error("Reference links must begin with http:// or https://.");
}

function limitForField_(definition) {
  if (HOUSE_ADEL_LIMITS[definition.key]) return HOUSE_ADEL_LIMITS[definition.key];
  return definition.type === "paragraph" ? HOUSE_ADEL_LIMITS.paragraph : HOUSE_ADEL_LIMITS.short;
}

function cleanSingleLine_(value, maximum) {
  const cleaned = value === undefined || value === null ? "" : String(value);
  const normalized = cleaned
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length > maximum) throw new Error("A submitted answer is too long.");
  return neutralizeFormula_(normalized);
}

function cleanMultiline_(value, maximum) {
  const cleaned = value === undefined || value === null ? "" : String(value);
  const normalized = cleaned
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (normalized.length > maximum) throw new Error("A submitted answer is too long.");
  return neutralizeFormula_(normalized);
}

function neutralizeFormula_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function parseDateOnly_(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error("The event date must use YYYY-MM-DD.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error("The event date is invalid.");
  }
  return date;
}

function openStoredForm_(properties) {
  const formId = properties.getProperty(HOUSE_ADEL_PROPERTIES.formId);
  if (!formId) return null;
  try {
    return FormApp.openById(formId);
  } catch (error) {
    throw new Error(
      "The stored Google Form could not be opened. Run recreateHouseAdelCommissionBackend() only if a replacement is intended.",
    );
  }
}

function openStoredSpreadsheet_(properties) {
  const spreadsheetId = properties.getProperty(HOUSE_ADEL_PROPERTIES.spreadsheetId);
  if (!spreadsheetId) return null;
  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    throw new Error(
      "The stored response spreadsheet could not be opened. Run recreateHouseAdelCommissionBackend() only if a replacement is intended.",
    );
  }
}

/**
 * Apps Script throws when getDestinationId() is called before a Form has a
 * response destination. Treat only that known runtime state as empty and
 * preserve every other error so setup cannot silently relink a broken Form.
 */
function getDestinationIdOrNull_(form) {
  try {
    return form.getDestinationId();
  } catch (error) {
    const message = error && typeof error.message === "string" ? error.message : String(error);
    if (/no response destination/i.test(message)) return null;
    throw error;
  }
}

function assertFormShape_(form) {
  if (formMatchesExpectedShape_(form)) return;
  const items = form.getItems();
  const titles = items.map(function (item) { return item.getTitle(); });
  const missing = HOUSE_ADEL_FIELDS.filter(function (definition) {
    return titles.indexOf(definition.title) === -1;
  });
  throw new Error(
    "The stored Form does not match the simplified " + HOUSE_ADEL_FIELDS.length + "-field structure. Missing: " +
      missing.map(function (definition) { return definition.title; }).join(", ") +
      ". Run migrateHouseAdelCommissionBackendToSimpleSchema() to retain the old files and create the new schema."
  );
}

function formMatchesExpectedShape_(form) {
  const items = form.getItems();
  if (items.length !== HOUSE_ADEL_FIELDS.length) return false;
  const titles = items.map(function (item) { return item.getTitle(); });
  return HOUSE_ADEL_FIELDS.every(function (definition) {
    return titles.indexOf(definition.title) !== -1;
  });
}

function readRecentSubmissionIds_(properties) {
  const stored = properties.getProperty(HOUSE_ADEL_PROPERTIES.recentSubmissionIds);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(function (value) { return typeof value === "string"; }) : [];
  } catch (error) {
    return [];
  }
}

function logBackendConfiguration_(form, spreadsheet) {
  console.log("Form edit URL: %s", form.getEditUrl());
  console.log("Form responder URL: %s", form.getPublishedUrl());
  console.log("Form ID: %s", form.getId());
  console.log("Linked spreadsheet URL: %s", spreadsheet.getUrl());
  console.log("Spreadsheet ID: %s", spreadsheet.getId());
  form.getItems().forEach(function (item) {
    console.log("Form item: %s | ID: %s | Type: %s", item.getTitle(), item.getId(), item.getType());
  });
}

function safeErrorMessage_(error) {
  const fallback = "The inquiry could not be accepted. Please try again.";
  if (!error || typeof error.message !== "string") return fallback;
  const message = error.message.replace(/[\r\n]+/g, " ").trim();
  return message && message.length <= 240 ? message : fallback;
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonpOutput_(prefix, value) {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]{0,95}$/.test(prefix)) {
    return jsonOutput_({ ok: false, confirmed: false, error: "Invalid callback." });
  }
  return ContentService
    .createTextOutput(prefix + "(" + JSON.stringify(value) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
