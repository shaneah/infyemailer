interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar = ({ sidebarOpen, setSidebarOpen }: NavbarProps) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary d-md-none">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <i className="bi bi-envelope-fill me-2"></i>
          InfyMailer
        </a>
        <button 
          id="sidebarToggle" 
          className="navbar-toggler border-0" 
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
