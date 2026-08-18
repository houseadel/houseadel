import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";

type ItemResponse = { title: string; value: unknown; type: string };

class MockItem {
  title = "";
  required = false;
  help = "";
  choices: string[] = [];

  constructor(readonly id: number, readonly type: string) {}

  setTitle(title: string) { this.title = title; return this; }
  setRequired(required: boolean) { this.required = required; return this; }
  setHelpText(help: string) { this.help = help; return this; }
  setIncludesYear() { return this; }
  setChoiceValues(choices: string[]) { this.choices = choices; return this; }
  getTitle() { return this.title; }
  getId() { return this.id; }
  getType() { return this.type; }
  asTextItem() { return this; }
  asParagraphTextItem() { return this; }
  asDateItem() { return this; }
  asMultipleChoiceItem() { return this; }
  createResponse(value: unknown): ItemResponse {
    if (this.type === "MULTIPLE_CHOICE" && !this.choices.includes(String(value))) {
      throw new Error(`Unsupported choice for ${this.title}`);
    }
    return { title: this.title, value, type: this.type };
  }
}

class MockFormResponse {
  readonly items: ItemResponse[] = [];

  constructor(private readonly form: MockForm) {}
  withItemResponse(item: ItemResponse) { this.items.push(item); return this; }
  submit() { this.form.submissions.push([...this.items]); return this; }
}

class MockForm {
  readonly id: string;
  readonly items: MockItem[] = [];
  readonly submissions: ItemResponse[][] = [];
  destinationId: string | null = null;

  constructor(public title: string, id: number) { this.id = `form-${id}`; }
  addTextItem() { return this.add("TEXT"); }
  addParagraphTextItem() { return this.add("PARAGRAPH_TEXT"); }
  addDateItem() { return this.add("DATE"); }
  addMultipleChoiceItem() { return this.add("MULTIPLE_CHOICE"); }
  private add(type: string) { const item = new MockItem(this.items.length + 1, type); this.items.push(item); return item; }
  setConfirmationMessage() { return this; }
  setAcceptingResponses() { return this; }
  setShowLinkToRespondAgain() { return this; }
  setPublishingSummary() { return this; }
  setProgressBar() { return this; }
  setShuffleQuestions() { return this; }
  setTitle(title: string) { this.title = title; return this; }
  setDestination(_type: string, id: string) { this.destinationId = id; return this; }
  getDestinationId() {
    if (this.destinationId === null) {
      throw new Error("The form currently has no response destination.");
    }
    return this.destinationId;
  }
  getItems() { return this.items; }
  getId() { return this.id; }
  getEditUrl() { return `https://docs.google.com/forms/d/${this.id}/edit`; }
  getPublishedUrl() { return `https://docs.google.com/forms/d/${this.id}/viewform`; }
  createResponse() { return new MockFormResponse(this); }
}

class MockSpreadsheet {
  readonly id: string;
  constructor(public title: string, id: number) { this.id = `sheet-${id}`; }
  getId() { return this.id; }
  getUrl() { return `https://docs.google.com/spreadsheets/d/${this.id}`; }
  rename(title: string) { this.title = title; }
}

class MockProperties {
  private readonly values = new Map<string, string>();
  getProperty(key: string) { return this.values.get(key) ?? null; }
  setProperty(key: string, value: string) { this.values.set(key, String(value)); return this; }
  deleteProperty(key: string) { this.values.delete(key); return this; }
  getProperties() { return Object.fromEntries(this.values); }
}

class MockOutput {
  constructor(readonly content: string) {}
  setMimeType() { return this; }
}

type BackendExports = {
  setup: () => unknown;
  migrate: () => unknown;
  doGet: (event: unknown) => MockOutput;
  doPost: (event: unknown) => MockOutput;
  fields: Array<{ key: string; title: string }>;
};

function createHarness() {
  const forms = new Map<string, MockForm>();
  const sheets = new Map<string, MockSpreadsheet>();
  const properties = new MockProperties();
  const context = {
    FormApp: {
      DestinationType: { SPREADSHEET: "SPREADSHEET" },
      create(title: string) {
        const form = new MockForm(title, forms.size + 1);
        forms.set(form.id, form);
        return form;
      },
      openById(id: string) {
        const form = forms.get(id);
        if (!form) throw new Error("Missing form");
        return form;
      },
    },
    SpreadsheetApp: {
      create(title: string) {
        const sheet = new MockSpreadsheet(title, sheets.size + 1);
        sheets.set(sheet.id, sheet);
        return sheet;
      },
      openById(id: string) {
        const sheet = sheets.get(id);
        if (!sheet) throw new Error("Missing sheet");
        return sheet;
      },
    },
    PropertiesService: { getScriptProperties: () => properties },
    LockService: {
      getScriptLock: () => ({ waitLock: () => undefined, releaseLock: () => undefined }),
    },
    ContentService: {
      MimeType: { JSON: "JSON", JAVASCRIPT: "JAVASCRIPT" },
      createTextOutput: (content: string) => new MockOutput(content),
    },
    Utilities: { getUuid: () => "12345678-1234-1234-1234-123456789abc" },
    console: { log: () => undefined, error: () => undefined },
    Date,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Math,
  };
  const code = readFileSync(resolve(process.cwd(), "google-apps-script", "Code.gs"), "utf8");
  vm.runInNewContext(
    `${code}\nglobalThis.__backend = { setup: setupHouseAdelCommissionBackend, migrate: migrateHouseAdelCommissionBackendToSimpleSchema, doGet: doGet, doPost: doPost, fields: HOUSE_ADEL_FIELDS };`,
    context,
  );
  const backend = (context as typeof context & { __backend: BackendExports }).__backend;
  return { backend, forms, sheets };
}

function payload(overrides: Record<string, unknown> = {}) {
  const now = new Date();
  return {
    submissionId: `HA-I-${now.getUTCFullYear()}-ABCDEFGH`,
    name: "Test visitor",
    contact: "test@example.com",
    planning: "A private dinner.",
    eventDate: "",
    websitePurpose: "Share the details and receive replies.",
    projectMeaning: "A family photograph.",
    moreDetails: "A small dinner after the ceremony.",
    references: "",
    anythingElse: "",
    submittedAt: now.toISOString(),
    formStartedAt: new Date(now.getTime() - 10_000).toISOString(),
    source: "houseadel.com",
    frontendVersion: "commission-form-v2",
    website: "",
    ...overrides,
  };
}

function post(backend: BackendExports, value: Record<string, unknown>) {
  const output = backend.doPost({
    postData: { contents: JSON.stringify(value), type: "text/plain" },
    parameter: {},
  });
  return JSON.parse(output.content) as Record<string, unknown>;
}

describe("Apps Script commission backend", () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    harness = createHarness();
  });

  it("creates exactly one 13-item Form and one linked Sheet when setup runs twice", () => {
    harness.backend.setup();
    harness.backend.setup();
    expect(harness.forms.size).toBe(1);
    expect(harness.sheets.size).toBe(1);
    const form = [...harness.forms.values()][0];
    const sheet = [...harness.sheets.values()][0];
    expect(form.items).toHaveLength(13);
    expect(form.destinationId).toBe(sheet.id);
    expect(form.items.map((item) => item.title)).toEqual(harness.backend.fields.map((field) => field.title));
  });

  it("relinks an existing Form only when its destination is different", () => {
    harness.backend.setup();
    const form = [...harness.forms.values()][0];
    const sheet = [...harness.sheets.values()][0];
    form.destinationId = "a-different-spreadsheet";
    harness.backend.setup();
    expect(harness.forms.size).toBe(1);
    expect(harness.sheets.size).toBe(1);
    expect(form.destinationId).toBe(sheet.id);
  });

  it("archives an old schema and creates one new active pair only once", () => {
    harness.backend.setup();
    const oldForm = [...harness.forms.values()][0];
    const oldSheet = [...harness.sheets.values()][0];
    for (let index = 0; index < 12; index += 1) oldForm.addTextItem().setTitle(`Old field ${index}`);

    harness.backend.migrate();
    expect(harness.forms.size).toBe(2);
    expect(harness.sheets.size).toBe(2);
    expect(oldForm.title).toContain("archived");
    expect(oldSheet.title).toContain("archived");
    const activeForm = [...harness.forms.values()][1];
    expect(activeForm.items).toHaveLength(13);

    harness.backend.migrate();
    expect(harness.forms.size).toBe(2);
    expect(harness.sheets.size).toBe(2);
  });

  it("submits all configured fields to the Form response", () => {
    harness.backend.setup();
    const allValues = payload({
      eventDate: "2027-02-14",
      moreDetails: "The old garden and dinner sequence.",
      references: "https://example.com/existing-site",
      anythingElse: "Nothing else.",
    });
    const result = post(harness.backend, allValues);
    const form = [...harness.forms.values()][0];
    expect(result).toMatchObject({ ok: true, submissionId: allValues.submissionId });
    expect(form.submissions).toHaveLength(1);
    expect(form.submissions[0]).toHaveLength(13);
    expect(form.submissions[0].map((response) => response.title)).toEqual(
      harness.backend.fields.map((field) => field.title),
    );
  });

  it("returns the same success without creating a duplicate response", () => {
    harness.backend.setup();
    const value = payload();
    expect(post(harness.backend, value).ok).toBe(true);
    expect(post(harness.backend, value)).toMatchObject({ ok: true, duplicate: true });
    expect([...harness.forms.values()][0].submissions).toHaveLength(1);
  });

  it("confirms an accepted submission through the JSONP status endpoint", () => {
    harness.backend.setup();
    const value = payload();
    expect(post(harness.backend, value).ok).toBe(true);
    const output = harness.backend.doGet({
      parameter: {
        action: "status",
        submissionId: value.submissionId,
        prefix: "houseAdelCallback",
      },
    });
    expect(output.content).toBe(
      `houseAdelCallback({"ok":true,"confirmed":true,"submissionId":"${value.submissionId}"});`,
    );
  });

  it("rejects a payload with a missing backend-required field", () => {
    harness.backend.setup();
    expect(post(harness.backend, payload({ projectMeaning: "" }))).toMatchObject({ ok: false });
    expect([...harness.forms.values()][0].submissions).toHaveLength(0);
  });

  it("rejects prose in the reference-links field", () => {
    harness.backend.setup();
    expect(post(harness.backend, payload({ references: "a Pinterest board" }))).toMatchObject({ ok: false });
    expect([...harness.forms.values()][0].submissions).toHaveLength(0);
  });
});
