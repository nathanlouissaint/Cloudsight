import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  generateExternalId,
  validateRoleArn,
  verifyAwsAccountConnection,
} from "../../../src/aws/services/account-connection.service";

describe(
  "AWS account connection service",
  () => {
    it(
      "generates high-entropy external IDs",
      () => {
        const first =
          generateExternalId();

        const second =
          generateExternalId();

        expect(first).toMatch(
          /^[a-f0-9]{64}$/,
        );

        expect(second).toMatch(
          /^[a-f0-9]{64}$/,
        );

        expect(first).not.toBe(
          second,
        );
      },
    );

    it(
      "accepts a valid role ARN",
      () => {
        expect(
          validateRoleArn(
            "arn:aws:iam::123456789012:role/CloudSightReadRole",
          ),
        ).toBe(
          "arn:aws:iam::123456789012:role/CloudSightReadRole",
        );
      },
    );

    it(
      "rejects an invalid role ARN",
      () => {
        expect(() =>
          validateRoleArn(
            "not-a-role-arn",
          ),
        ).toThrow(
          "AWS role ARN is invalid",
        );
      },
    );

    it(
      "verifies the assumed AWS account identity",
      async () => {
        const send =
          vi.fn()
            .mockResolvedValueOnce({
              Credentials: {
                AccessKeyId:
                  "access-key",
                SecretAccessKey:
                  "secret-key",
                SessionToken:
                  "session-token",
              },
            })
            .mockResolvedValueOnce({
              Account:
                "123456789012",
              Arn:
                "arn:aws:sts::123456789012:assumed-role/CloudSightReadRole/cloudsight-account-verification",
            });

        const createStsClient =
          vi.fn(() => ({
            send,
          }));

        const result =
          await verifyAwsAccountConnection(
            {
              roleArn:
                "arn:aws:iam::123456789012:role/CloudSightReadRole",

              externalId:
                "external-id",

              expectedAwsAccountId:
                "123456789012",
            },
            createStsClient,
          );

        expect(result).toEqual({
          accountId:
            "123456789012",

          arn:
            "arn:aws:sts::123456789012:assumed-role/CloudSightReadRole/cloudsight-account-verification",
        });

        expect(send).toHaveBeenCalledTimes(
          2,
        );
      },
    );

    it(
      "rejects a role from the wrong AWS account",
      async () => {
        const send =
          vi.fn()
            .mockResolvedValueOnce({
              Credentials: {
                AccessKeyId:
                  "access-key",
                SecretAccessKey:
                  "secret-key",
                SessionToken:
                  "session-token",
              },
            })
            .mockResolvedValueOnce({
              Account:
                "999999999999",
            });

        const createStsClient =
          vi.fn(() => ({
            send,
          }));

        await expect(
          verifyAwsAccountConnection(
            {
              roleArn:
                "arn:aws:iam::123456789012:role/CloudSightReadRole",

              externalId:
                "external-id",

              expectedAwsAccountId:
                "123456789012",
            },
            createStsClient,
          ),
        ).rejects.toThrow(
          "AWS role belongs to a different account",
        );
      },
    );

    it(
      "rejects missing temporary credentials",
      async () => {
        const send =
          vi.fn()
            .mockResolvedValueOnce({
              Credentials: {},
            });

        const createStsClient =
          vi.fn(() => ({
            send,
          }));

        await expect(
          verifyAwsAccountConnection(
            {
              roleArn:
                "arn:aws:iam::123456789012:role/CloudSightReadRole",

              externalId:
                "external-id",

              expectedAwsAccountId:
                "123456789012",
            },
            createStsClient,
          ),
        ).rejects.toThrow(
          "AWS did not return temporary credentials",
        );
      },
    );
  },
);
