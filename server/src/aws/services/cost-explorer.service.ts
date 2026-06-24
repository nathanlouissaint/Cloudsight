import { getAwsProvider }
  from "../factory/provider.factory";

export async function getCostSummary() {
  const provider =
    getAwsProvider();

  return provider.getCostSummary();
}
