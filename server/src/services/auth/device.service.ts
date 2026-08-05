export type DeviceType =
  | "Desktop"
  | "Mobile"
  | "Tablet"
  | "Unknown";

export interface DeviceInfo {
  browser: string;
  browserVersion: string | null;
  operatingSystem: string;
  deviceType: DeviceType;
  deviceName: string;
}

export class DeviceService {
  parse(
    userAgent?: string | null,
  ): DeviceInfo {
    if (!userAgent) {
      return {
        browser: "Unknown Browser",
        browserVersion: null,
        operatingSystem: "Unknown OS",
        deviceType: "Unknown",
        deviceName: "Unknown Device",
      };
    }

    const ua = userAgent.toLowerCase();

    const browser =
      this.detectBrowser(ua);

    const operatingSystem =
      this.detectOperatingSystem(ua);

    const deviceType =
      this.detectDeviceType(ua);

    return {
      browser: browser.name,
      browserVersion: browser.version,
      operatingSystem,
      deviceType,
      deviceName: `${operatingSystem} • ${browser.name}`,
    };
  }

  private detectBrowser(
    ua: string,
  ): {
    name: string;
    version: string | null;
  } {
    const browsers = [
      {
        name: "Edge",
        regex: /edg\/([\d.]+)/,
      },
      {
        name: "Chrome",
        regex: /chrome\/([\d.]+)/,
      },
      {
        name: "Firefox",
        regex: /firefox\/([\d.]+)/,
      },
      {
        name: "Safari",
        regex: /version\/([\d.]+).*safari/,
      },
    ];

    for (const browser of browsers) {
      const match =
        ua.match(browser.regex);

      if (match) {
        return {
          name: browser.name,
          version: match[1] ?? null,
        };
      }
    }

    return {
      name: "Unknown Browser",
      version: null,
    };
  }

  private detectOperatingSystem(
    ua: string,
  ): string {
    if (ua.includes("windows")) {
      return "Windows";
    }

    if (
      ua.includes("mac os") ||
      ua.includes("macintosh")
    ) {
      return "macOS";
    }

    if (ua.includes("android")) {
      return "Android";
    }

    if (
      ua.includes("iphone") ||
      ua.includes("ipad") ||
      ua.includes("ios")
    ) {
      return "iOS";
    }

    if (ua.includes("linux")) {
      return "Linux";
    }

    return "Unknown OS";
  }

  private detectDeviceType(
    ua: string,
  ): DeviceType {
    if (
      ua.includes("ipad") ||
      ua.includes("tablet")
    ) {
      return "Tablet";
    }

    if (
      ua.includes("iphone") ||
      ua.includes("android") ||
      ua.includes("mobile")
    ) {
      return "Mobile";
    }

    if (
      ua.includes("windows") ||
      ua.includes("macintosh") ||
      ua.includes("linux")
    ) {
      return "Desktop";
    }

    return "Unknown";
  }
}

export const deviceService =
  new DeviceService();