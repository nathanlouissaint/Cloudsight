import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Fields = { name: string; email: string; company: string; goals: string };
type Errors = Partial<Record<keyof Fields, string>>;

const initialFields: Fields = { name: "", email: "", company: "", goals: "" };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid work email.";
  if (!values.company.trim()) errors.company = "Enter your company name.";
  if (!values.goals.trim()) errors.goals = "Tell us what you want to improve.";
  return errors;
}

export default function DemoRequestForm() {
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();
  const update = (key: keyof Fields, value: string) => { setFields(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const nextErrors = validate(fields); setErrors(nextErrors); if (!Object.keys(nextErrors).length) setSubmitted(true); };
  return <section className="demo-request" id="demo-request" aria-labelledby="demo-title"><div className="demo-request-intro"><span className="section-number">04 — See it with your numbers</span><h2 id="demo-title">Bring your next question.</h2><p>Tell us what your team is trying to understand. This concept form stays in your browser and does not send information anywhere.</p><ul><li><CheckCircle2 size={15}/> A focused walkthrough of the product</li><li><CheckCircle2 size={15}/> Fictional sample data, shaped around your use case</li><li><CheckCircle2 size={15}/> No sales follow-up from this concept site</li></ul></div><div className="demo-form-shell"><AnimatePresence mode="wait">{submitted ? <motion.div key="confirmation" className="demo-confirmation" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .35 }} role="status"><span><CheckCircle2 size={20}/></span><h3>Thanks — your request is noted.</h3><p>This is a simulated confirmation for the AETHER concept. No data was sent or stored.</p><button type="button" onClick={() => { setSubmitted(false); setFields(initialFields); }}>Start another request <ArrowRight size={14}/></button></motion.div> : <motion.form key="form" noValidate onSubmit={submit} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}><div className="demo-field-row"><Field id="demo-name" label="Name" value={fields.name} error={errors.name} onChange={value => update("name", value)} autoComplete="name"/><Field id="demo-email" label="Work email" type="email" value={fields.email} error={errors.email} onChange={value => update("email", value)} autoComplete="email"/></div><Field id="demo-company" label="Company" value={fields.company} error={errors.company} onChange={value => update("company", value)} autoComplete="organization"/><label className={errors.goals ? "has-error" : ""} htmlFor="demo-goals"><span>What would you like to understand better?</span><textarea id="demo-goals" value={fields.goals} onChange={event => update("goals", event.target.value)} aria-invalid={Boolean(errors.goals)} aria-describedby={errors.goals ? "demo-goals-error" : undefined} rows={4} placeholder="For example: where growth is coming from, or why conversion changed." />{errors.goals && <small id="demo-goals-error">{errors.goals}</small>}</label><button className="demo-submit" type="submit">Request a concept demo <ArrowRight size={15}/></button><p className="demo-note">Demo requests are simulated in this fictional product experience.</p></motion.form>}</AnimatePresence></div></section>;
}

function Field({ id, label, type = "text", value, error, onChange, autoComplete }: { id: string; label: string; type?: string; value: string; error?: string; onChange: (value: string) => void; autoComplete: string }) {
  return <label className={error ? "has-error" : ""} htmlFor={id}><span>{label}</span><input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />{error && <small id={`${id}-error`}>{error}</small>}</label>;
}
