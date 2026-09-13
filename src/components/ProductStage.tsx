import { useLanguage } from '../i18n/LanguageContext'

export default function ProductStage() {
  const { t } = useLanguage()
  return <div className="product-stage" role="img" aria-label={t.stageLabel}>
    <div className="stage-grid" aria-hidden="true" />
    <div className="stage-top" aria-hidden="true"><span>{t.edition}</span><span>01 / 01</span></div>
    <div className="parallax-stage" aria-hidden="true">
      <div className="stage-glow" />
      <div className="scanner scanner-outer" /><div className="scanner scanner-inner" /><div className="scanner scanner-dashed" />
      <div className="floating-stage"><div className="target-corner top-start" /><div className="target-corner top-end" /><div className="target-corner bottom-start" /><div className="target-corner bottom-end" /><span className="stage-cross">+</span><div className="stage-center"><span className="stage-monogram">GG</span><span className="stage-caption">{t.stage}</span><span className="loading-line" /></div></div>
      <div className="orbit-dot" /><div className="stage-baseline" />
    </div>
    <div className="stage-bottom" aria-hidden="true"><span>+ 21.4858° N</span><span>39.1925° E +</span></div>
  </div>
}
