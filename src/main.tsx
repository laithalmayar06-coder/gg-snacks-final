import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { LanguageProvider } from './i18n/LanguageContext'
import App from './App'
import { CmsProvider } from './cms/CmsProvider'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow-condensed/800.css'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><CmsProvider><LanguageProvider><App /></LanguageProvider></CmsProvider></BrowserRouter></React.StrictMode>,
)
