import StaffLogout from '../auth/StaffLogout'
import { Link, useLocation } from 'react-router'
import { cmsSections } from './schema'
import './cms.css'
export default function AdminNavigation() {
  const { pathname } = useLocation()
  return <nav className="cms-navigation" aria-label="Staff navigation" dir="ltr" lang="en"><Link to="/dashboard/ratings" aria-current={pathname === '/dashboard/ratings' ? 'page' : undefined}>Ratings</Link>{Object.entries(cmsSections).map(([key, section]) => <Link to={`/admin/${key}`} key={key} aria-current={pathname === `/admin/${key}` ? 'page' : undefined}>{section.title}</Link>)}<Link to="/admin/enquiries" aria-current={pathname === '/admin/enquiries' ? 'page' : undefined}>Enquiries</Link><Link to="/">View website</Link><StaffLogout /></nav>
}
