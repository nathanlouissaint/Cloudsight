import { MockProvider }
  from "../adapters/mock.provider";

const provider =
  new MockProvider();

export async function getCostSummary() {
  return provider.getCostSummary();
}
