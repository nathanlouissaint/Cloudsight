export interface AwsConnectionVerification {
  connected: boolean;
  accountId: string;
  roleArn: string;
  assumedRoleArn: string;
}

interface AwsConnectionError {
  connected?: boolean;
  message?: string;
  error?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function verifyAwsConnection(
  roleArn: string,
): Promise<AwsConnectionVerification> {
  const response = await fetch(
    `${API_BASE_URL}/aws/verify-connection`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleArn,
      }),
    },
  );

  const body =
    (await response.json()) as
      | AwsConnectionVerification
      | AwsConnectionError;

  if (!response.ok) {
    const errorBody =
      body as AwsConnectionError;

    throw new Error(
      errorBody.error ??
        errorBody.message ??
        "Unable to verify AWS connection.",
    );
  }

  return body as AwsConnectionVerification;
}
