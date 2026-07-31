import {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import type { ReactNode } from "react";

import type { Session } from "../../auth/types/session";

interface Props {
  deviceType: Session["deviceType"];
}

const ICONS: Record<
  Session["deviceType"],
  ReactNode
> = {
  Desktop: <Monitor size={22} />,
  Mobile: <Smartphone size={22} />,
  Tablet: <Tablet size={22} />,
  Unknown: <Laptop size={22} />,
};

export default function DeviceBadge({
  deviceType,
}: Props) {
  return (
    <div className="device-badge">
      {ICONS[deviceType]}
    </div>
  );
}