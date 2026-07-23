import { UAParser } from "ua-parser-js";

export interface SessionMetadata {
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
}

export class SessionMetadataService {
  build(
    userAgent: string | undefined,
    ipAddress: string | undefined,
  ): SessionMetadata {
    const parser = new UAParser(userAgent);

    const browser =
      parser.getBrowser().name ?? "Unknown Browser";

    const os =
      parser.getOS().name ?? "Unknown OS";

    const device =
      parser.getDevice();

    let deviceName: string;

    if (device.type === "mobile") {
      deviceName =
        `${device.vendor ?? "Mobile"} · ${browser}`;
    } else if (device.type === "tablet") {
      deviceName =
        `${device.vendor ?? "Tablet"} · ${browser}`;
    } else {
      deviceName =
        `${os} · ${browser}`;
    }

    return {
      deviceName,
      userAgent,
      ipAddress,
    };
  }
}

export const sessionMetadataService =
  new SessionMetadataService();