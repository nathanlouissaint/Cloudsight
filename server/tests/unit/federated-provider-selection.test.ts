import { describe, expect, it } from "vitest";
import { getFederatedProvider, isControlledFederatedProviderEnabled } from "../../src/services/auth/federated-provider.registry";

describe("startup federated provider selection", () => {
  it("requires test mode and the exact explicit E2E flag", () => {
    expect(isControlledFederatedProviderEnabled({ NODE_ENV: "test", CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER: "1" })).toBe(true);
    expect(isControlledFederatedProviderEnabled({ NODE_ENV: "test", CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER: "true" })).toBe(false);
    expect(isControlledFederatedProviderEnabled({ NODE_ENV: "test" })).toBe(false);
  });

  it("never enables the controlled provider outside test", () => {
    expect(isControlledFederatedProviderEnabled({ NODE_ENV: "development", CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER: "1" })).toBe(false);
    expect(isControlledFederatedProviderEnabled({ NODE_ENV: "production", CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER: "1" })).toBe(false);
  });

  it("does not expose a GitHub provider before the protocol boundary exists", () => {
    expect(getFederatedProvider("GITHUB")).toBeNull();
  });
});
