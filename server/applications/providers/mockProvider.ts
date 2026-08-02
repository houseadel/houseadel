import type {
  ApplicationProvider,
  ApplicationProviderContext,
  ApplicationProviderResult,
  ApplicationRecord,
} from "../types";

export class MockApplicationProvider implements ApplicationProvider {
  readonly mode = "mock" as const;

  async accept(
    _application: ApplicationRecord,
    context: ApplicationProviderContext,
  ): Promise<ApplicationProviderResult> {
    return {
      accepted: true,
      mode: this.mode,
      receiptId: `local-${context.requestId}`,
    };
  }
}
