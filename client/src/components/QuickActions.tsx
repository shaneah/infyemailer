import { Link } from "wouter";

interface QuickActionsProps {
  onCreateEmail: () => void;
}

const QuickActions = ({ onCreateEmail }: QuickActionsProps) => {
  return (
    <>
      <h5 className="mb-3">Quick Actions</h5>
      <div className="row row-cols-1 row-cols-md-4 g-4 mb-5">
        <div className="col">
          <div className="card hover-card h-100 text-center">
            <div className="card-body p-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-envelope-plus fs-4 text-primary"></i>
              </div>
              <h5 className="card-title">Create Email</h5>
              <p className="card-text text-muted">Design and send a one-time email to your subscribers.</p>
              <button 
                className="btn btn-primary w-100"
                onClick={onCreateEmail}
              >
                Create Email
              </button>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card hover-card h-100 text-center">
            <div className="card-body p-4">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-people-fill fs-4 text-success"></i>
              </div>
              <h5 className="card-title">Add Contacts</h5>
              <p className="card-text text-muted">Import or manually add new contacts to your lists.</p>
              <Link href="/contacts">
                <button className="btn btn-outline-success w-100">
                  Manage Contacts
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card hover-card h-100 text-center">
            <div className="card-body p-4">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-file-earmark-text fs-4 text-info"></i>
              </div>
              <h5 className="card-title">Templates</h5>
              <p className="card-text text-muted">Create or modify email templates for campaigns.</p>
              <Link href="/templates">
                <button className="btn btn-outline-info w-100">
                  View Templates
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card hover-card h-100 text-center">
            <div className="card-body p-4">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-bar-chart-line fs-4 text-warning"></i>
              </div>
              <h5 className="card-title">Reports</h5>
              <p className="card-text text-muted">View detailed analytics and campaign reports.</p>
              <Link href="/analytics">
                <button className="btn btn-outline-warning w-100">
                  View Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickActions;
