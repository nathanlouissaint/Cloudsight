import posthog from "posthog-js";

export type AnalyticsEventName =
  | "landing_viewed"
  | "hero_cta_clicked"
  | "signup_started"
  | "signup_completed"
  | "aws_connection_started"
  | "mock_aws_account_verified"
  | "sample_data_selected"
  | "aws_access_requested"
  | "budget_created"
  | "analysis_viewed"
  | "demo_requested"
  | "website_audit_page_viewed"
  | "website_audit_cta_clicked"
  | "website_audit_form_started"
  | "website_audit_form_submitted"
  | "website_audit_qualified_lead"
  | "website_audit_booking_clicked";

type AnalyticsPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsProperties = Record<
  string,
  AnalyticsPropertyValue
>;

let initialized = false;

function getConfiguration() {
  const key = import.meta.env.VITE_POSTHOG_KEY?.trim();
  const host = import.meta.env.VITE_POSTHOG_HOST?.trim();

  if (!key || !host) {
    return null;
  }

  return { key, host };
}

export const analytics = {
  init() {
    if (initialized) {
      return;
    }

    const configuration = getConfiguration();

    if (!configuration) {
      return;
    }

    try {
      posthog.init(configuration.key, {
        api_host: configuration.host,
        autocapture: false,
        capture_pageleave: false,
        capture_pageview: false,
      });

      initialized = true;
    } catch {
      // Analytics must never prevent the application from loading.
    }
  },

  track(
    eventName: AnalyticsEventName,
    properties?: AnalyticsProperties,
  ) {
    if (!initialized) {
      return;
    }

    try {
      posthog.capture(eventName, {
        environment: "development",
        ...properties,
      });
    } catch {
      // Analytics must never prevent product actions from completing.
    }
  },

  identify(
    userId: string,
    properties?: AnalyticsProperties,
  ) {
    if (!initialized) {
      return;
    }

    try {
      posthog.identify(userId, properties);
    } catch {
      // Analytics must never prevent authentication from completing.
    }
  },

  reset() {
    if (!initialized) {
      return;
    }

    try {
      posthog.reset();
    } catch {
      // Analytics must never prevent logout from completing.
    }
  },
};
