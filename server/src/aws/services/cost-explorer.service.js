import { MockProvider } from "../adapters/mock.provider";
const provider = new MockProvider();
export async function getCostSummary() {
    return provider.getCostSummary();
}
//# sourceMappingURL=cost-explorer.service.js.map