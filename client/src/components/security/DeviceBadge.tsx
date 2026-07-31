import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import clsx from "clsx";

import type { Session } from "../../auth/types/session";

interface Props {
  deviceType: Session["deviceType"];
}

const DEVICE_CONFIG: Record<
  Session["deviceType"],
  {
    icon: React.ReactNode;
    label: string;
    className: string;
  }
> = {
  Desktop: {
    icon: <Monitor size={22} />,
    label: "Desktop",
    className: "device-badge--desktop",
  },
  Mobile: {
    icon: <Smartphone size={22} />,
    label: "Mobile",
    className: "device-badge--mobile",
  },
  Tablet: {
    icon: <Tablet size={22} />,
    label: "Tablet",
    className: "device-badge--tablet",
  },
  Unknown: {
    icon: <Laptop size={22} />,
    label: "Unknown",
    className: "device-badge--unknown",
  },
};

export default function DeviceBadge({
  deviceType,
}: Props) {
  const config =
    DEVICE_CONFIG[deviceType];

  return (
    <div
      className={clsx(
        "device-badge",
        config.className,
      )}
      title={config.label}
      aria-label={config.label}
    >
      {config.icon}
    </div>
  );
}