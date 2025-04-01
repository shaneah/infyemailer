import { Link, useLocation } from "wouter";

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const [location] = useLocation();
  
  return (
    <nav id="sidebar" className={`col-md-3 col-lg-2 d-md-block bg-dark sidebar ${open ? 'show' : ''}`}>
      <div className="position-sticky pt-3 h-100">
        <div className="d-flex align-items-center justify-content-between px-3 mb-4 d-none d-md-flex">
          <Link href="/" className="text-decoration-none text-white fs-4 fw-bold">
            <i className="bi bi-envelope-fill me-2"></i>MailFlow
          </Link>
        </div>
        <div className="px-3 mb-4">
          <div className="d-flex align-items-center text-white mb-3">
            <div className="rounded-circle me-2 bg-gray-500 w-8 h-8 flex items-center justify-center">JS</div>
            <div>
              <div className="fw-bold">John Smith</div>
              <small className="text-muted">Pro Plan</small>
            </div>
          </div>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="/" className={`nav-link ${location === '/' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/campaigns" className={`nav-link ${location === '/campaigns' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-megaphone me-2"></i>
              Campaigns
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/emails" className={`nav-link ${location === '/emails' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-envelope me-2"></i>
              Emails
              <span className="position-relative">
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </span>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/templates" className={`nav-link ${location === '/templates' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-file-earmark-text me-2"></i>
              Templates
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/contacts" className={`nav-link ${location === '/contacts' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-people me-2"></i>
              Contacts
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/analytics" className={`nav-link ${location === '/analytics' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-graph-up me-2"></i>
              Analytics
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/settings" className={`nav-link ${location === '/settings' ? 'active text-white' : 'text-white-50'}`}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </Link>
          </li>
        </ul>
        <hr className="text-white-50" />
        <div className="px-3 mt-auto mb-3">
          <div className="card bg-primary bg-opacity-10 border-0">
            <div className="card-body p-3">
              <h6 className="text-white mb-2">Storage</h6>
              <div className="progress mb-2" style={{ height: '6px' }}>
                <div className="progress-bar" role="progressbar" style={{ width: '65%' }} aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}></div>
              </div>
              <small className="text-white-50">65% of 10GB used</small>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
