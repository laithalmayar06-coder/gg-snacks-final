import { submitEnquiry } from '../services/enquiries'
import { enquiryCopy } from '../data/enquiryCopy'
import { useState, useRef, type FormEvent } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { pageCopy } from '../data/publicContent'
import { requestTypes, emptyEnquiry, validateEnquiry, type EnquiryField, type EnquiryValues } from '../data/enquiries'

export default function EnquiryForm({ business = false }: { business?: boolean }) {
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
  const fields: EnquiryField[] = business ? ['name', 'company', 'email', 'phone', 'requestType', 'message'] : ['name', 'email', 'phone', 'message']
  const change = (key: EnquiryField, value: string) => {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setChecked(false)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending.current || checked) return
    const next = validateEnquiry(values, business)
    setErrors(next)
    setFailed(false)
    if (Object.keys(next).length === 0) {
      pending.current = true; setBusy(true)
      try {
        await submitEnquiry({ ...values, requestType: business ? values.requestType : 'general' }, language)
        setChecked(true)
      } catch { setFailed(true) }
      finally { pending.current = false; setBusy(false) }
    }
    requestAnimationFrame(() => summary.current?.focus())

  }
  return <form className="public-form gg-card" onSubmit={submit} noValidate aria-describedby="enquiry-note">
    <p id="enquiry-note" className="public-notice">{copy.note}</p>
    <div ref={summary} tabIndex={-1} role="status" className="form-status">
      {busy ? copy.sending : failed ? copy.failure : checked ? copy.success : Object.values(errors).some(Boolean) ? c.invalid : ''}
    </div>
    <div className="public-form-grid">{fields.map(key => {
      const error = errors[key]
      const common = { id: `enquiry-${key}`, name: key, value: values[key], disabled: busy || checked, required: key !== 'phone' && key !== 'company', 'aria-invalid': Boolean(error), 'aria-describedby': error ? `error-${key}` : undefined }
      return <div className={`public-field ${key === 'message' ? 'public-field-wide' : ''}`} key={key}>
        <label htmlFor={common.id}>{c[key]}</label>
        {key === 'requestType' ? <select {...common} onChange={e => change(key, e.target.value)}><option value="">{c.choose}</option>{requestTypes.map(type => <option key={type.id} value={type.id}>{type.label[language]}</option>)}</select>
          : key === 'message' ? <textarea {...common} rows={6} maxLength={3000} onChange={e => change(key, e.target.value)} />
          : <input {...common} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} autoComplete={key === 'company' ? 'organization' : key === 'phone' ? 'tel' : key} dir={key === 'email' || key === 'phone' ? 'ltr' : 'auto'} maxLength={key === 'email' ? 254 : 200} onChange={e => change(key, e.target.value)} />}
        {error && <span id={`error-${key}`} className="field-error">{c[error]}</span>}
      </div>
    })}</div>
    <button className="gg-button gg-button-primary" type="submit" disabled={busy || checked}>{busy ? copy.sending : copy.send}<span aria-hidden="true">↗</span></button>
  </form>
}
