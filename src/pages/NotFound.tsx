import { Link } from 'react-router'
import ProductPageLayout from '../components/ProductPageLayout'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  return <ProductPageLayout><div className="catalogue-not-found"><p className="catalogue-kicker" dir="ltr">GG / 404</p><h1>{t.pageNotFound}</h1><Link className="catalogue-button" to="/">{t.ratingBack}</Link></div></ProductPageLayout>
}
