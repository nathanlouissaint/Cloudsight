

import FeatureList from "./FeatureList";
import TrustedTechnologies from "./TrustedTechnologies";

export default function AuthMarketing() {
  return (
    <div className="auth-marketing">
      
      <p className="auth-marketing__eyebrow">
        CloudSight
      </p>

      <h1 className="auth-marketing__title">
        See cloud costs.
        <span> Act with confidence.</span>
      </h1>

      <p className="auth-marketing__description">
        CloudSight helps engineering and finance teams understand AWS spending,
        forecast future costs, detect unusual activity, and make better cloud
        decisions from one clear dashboard.
      </p>

      <FeatureList />

      <TrustedTechnologies />
    </div>
  );
}
