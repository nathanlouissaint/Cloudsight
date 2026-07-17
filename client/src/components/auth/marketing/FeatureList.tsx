import {
  BellRing,
  ChartNoAxesCombined,
  CircleDollarSign,
  Eye,
} from "lucide-react";

import FeatureItem from "./FeatureItem";

const features = [
  {
    icon: Eye,
    title: "Real-time visibility",
    description:
      "Understand where your AWS budget is going across services and accounts.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Forecast and plan",
    description:
      "Estimate future spending before cloud costs become a business problem.",
  },
  {
    icon: BellRing,
    title: "Detect unusual spending",
    description:
      "Identify unexpected cost increases and budget risks earlier.",
  },
  {
    icon: CircleDollarSign,
    title: "Optimize cloud spend",
    description:
      "Turn cost data into clear opportunities to reduce waste.",
  },
];

export default function FeatureList() {
  return (
    <div className="auth-feature-list">
      {features.map((feature) => (
        <FeatureItem
          key={feature.title}
          {...feature}
        />
      ))}
    </div>
  );
}
