import { submitEnquiry } from '../services/enquiries'
import { enquiryCopy } from '../data/enquiryCopy'
import { useState, useRef, type FormEvent } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { pageCopy } from '../data/publicContent'
import { requestTypes, emptyEnquiry, validateEnquiry, type EnquiryField, type EnquiryValues } from '../data/enquiries'

interface SignalHubOptions {
  subject: string
  onSubjectChange: (subject: string) => void
  onLockedChange: (locked: boolean) => void
  labels: Partial<Record<EnquiryField, string>>
  note: string
  send: string
  subjects: { id: string; label: string }[]
}

export default function EnquiryForm({ business = false, signalHub }: { business?: boolean; signalHub?: SignalHubOptions }) {
  const { language } = useLanguage()
  const c = pageCopy[language]
  const copy = enquiryCopy[language]
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const pending = useRef(false)
  const [values, setValues] = useState<EnquiryValues>({ ...emptyEnquiry })
  const [errors, setErrors] = useState<ReturnType<typeof validateEnquiry>>({})
  const [checked, setChecked] = useState(false)
  const summary = useRef<HTMLDivElement>(null)
  const currentValues = signalHub ? { ...values, requestType: signalHub.subject } : values
  const prefix = signalHub ? 'signal-enquiry' : 'enquiry'
  const noteId = signalHub ? 'signal-enquiry-note' : 'enquiry-note'
  const fields: EnquiryField[] = signalHub ? ['name', 'email', 'requestType', 'message'] : business ? ['name', 'company', 'email', 'phone', 'requestType', 'message'] : ['name', 'email', 'phone', 'message']
  const change = (key: EnquiryField, value: string) => {
    if (key === 'requestType' && signalHub) signalHub.onSubjectChange(value)
    else setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setChecked(false)
  }
  const visibleErrors = signalHub?.subject ? { ...errors, requestType: undefined } : errors
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending.current || checked) return
    const next = validateEnquiry(currentValues, business || Boolean(signalHub))
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length === 0) {
      pending.current = true; setBusy(true); signalHub?.onLockedChange(true)
      let accepted = false
      try {
        await submitEnquiry({ ...currentValues, requestType: business || signalHub ? currentValues.requestType : 'general' }, language)
        accepted = true; setChecked(true)
      } catch { setFailed(true) }
      finally { pending.current = false; setBusy(false); signalHub?.onLockedChange(accepted) }
    }
    requestAnimationFrame(() => summary.current?.focus())

  }
  return <form className={signalHub ? "signal-form" : "public-form gg-card"} onSubmit={submit} noValidate aria-describedby={noteId} aria-labelledby={signalHub ? "signal-form-title" : undefined} aria-busy={busy}>
    <p id={noteId} className="public-notice">{signalHub?.note || copy.note}</p>
    <div ref={summary} tabIndex={-1} role="status" className="form-status">
      {busy ? copy.sending : failed ? copy.failure : checked ? copy.success : Object.values(visibleErrors).some(Boolean) ? c.invalid : ''}
    </div>
    <div className="public-form-grid">{fields.map(key => {
      const error = key === 'requestType' && signalHub?.subject ? undefined : errors[key]
      const common = { id: `${prefix}-${key}`, name: key, value: currentValues[key], disabled: busy || checked, required: key !== 'phone' && key !== 'company', 'aria-invalid': Boolean(error), 'aria-describedby': error ? `${signalHub ? 'signal-' : ''}error-${key}` : undefined }
      return <div className={`public-field ${key === 'message' ? 'public-field-wide' : ''}`} key={key}>
        <label htmlFor={common.id}>{signalHub?.labels[key] || c[key]}{signalHub && <span aria-hidden="true"> *</span>}</label>
        {key === 'requestType' ? <select {...common} onChange={e => change(key, e.target.value)}><option value="">{c.choose}</option>{(signalHub?.subjects || requestTypes.map(type => ({ id: type.id, label: type.label[language] }))).map(type => <option key={type.id} value={type.id}>{type.label}</option>)}</select>
          : key === 'message' ? <textarea {...common} rows={signalHub ? 4 : 6} dir={signalHub ? 'auto' : undefined} maxLength={3000} onChange={e => change(key, e.target.value)} />
          : <input {...common} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} autoComplete={key === 'company' ? 'organization' : key === 'phone' ? 'tel' : key} dir={key === 'email' || key === 'phone' ? 'ltr' : 'auto'} maxLength={key === 'email' ? 254 : 200} onChange={e => change(key, e.target.value)} />}
        {error && <span id={`${signalHub ? 'signal-' : ''}error-${key}`} className="field-error">{c[error]}</span>}
      </div>
    })}</div>
    <button className="gg-button gg-button-primary" type="submit" disabled={busy || checked}>{busy ? copy.sending : signalHub?.send || copy.send}{signalHub ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg> : <span aria-hidden="true">↗</span>}</button>
  </form>
}
