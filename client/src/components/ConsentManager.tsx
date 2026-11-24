import { useState } from "react";
import { consent, type ConsentPreferences } from "../lib/analytics";

const denied: ConsentPreferences = { analytics: false, marketing: false };
const accepted: ConsentPreferences = { analytics: true, marketing: true };

export function ConsentManager() {
  const saved = consent.get();
  const [isOpen, setIsOpen] = useState(saved === null);
  const [isManaging, setIsManaging] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(saved ?? denied);
  const save = (next: ConsentPreferences) => {
    consent.set(next); setPreferences(next); setIsOpen(false); setIsManaging(false);
  };
  return <>
    {isOpen && <section className="consent-manager" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div>
        <p className="consent-manager__eyebrow">Your privacy</p>
        <h2 id="consent-title">Choose how CloudSight measures this site.</h2>
        <p>Essential site functions always remain on. Analytics and advertising are optional and disabled unless you choose them.</p>
        {isManaging && <fieldset className="consent-manager__preferences">
          <legend>Preferences</legend>
          <label><input type="checkbox" checked={preferences.analytics} onChange={(event) => setPreferences({ ...preferences, analytics: event.target.checked })} /> Analytics — understand aggregate site use.</label>
          <label><input type="checkbox" checked={preferences.marketing} onChange={(event) => setPreferences({ ...preferences, marketing: event.target.checked })} /> Marketing — measure ads and support retargeting.</label>
        </fieldset>}
      </div>
      <div className="consent-manager__actions">
        {!isManaging && <button type="button" className="consent-manager__text" onClick={() => setIsManaging(true)}>Manage preferences</button>}
        {isManaging && <button type="button" className="consent-manager__text" onClick={() => save(preferences)}>Save preferences</button>}
        {!isManaging && <button type="button" className="consent-manager__text" onClick={() => save(denied)}>Reject all</button>}
        {!isManaging && <button type="button" className="consent-manager__accept" onClick={() => save(accepted)}>Accept all</button>}
      </div>
    </section>}
    {!isOpen && <button type="button" className="consent-manager__reopen" onClick={() => { setPreferences(consent.get() ?? denied); setIsManaging(true); setIsOpen(true); }}>Privacy preferences</button>}
  </>;
}
