const cloudSightPrincipalArn =
  import.meta.env.VITE_CLOUDSIGHT_AWS_PRINCIPAL_ARN ??
  "";

export function getCloudSightPrincipalArn(): string {
  return cloudSightPrincipalArn.trim();
}

export function buildAwsTrustPolicy(
  externalId: string,
): string | null {
  const principalArn =
    getCloudSightPrincipalArn();

  if (
    !principalArn ||
    !externalId
  ) {
    return null;
  }

  return JSON.stringify(
    {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: principalArn,
          },
          Action: "sts:AssumeRole",
          Condition: {
            StringEquals: {
              "sts:ExternalId":
                externalId,
            },
          },
        },
      ],
    },
    null,
    2,
  );
}
