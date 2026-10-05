import logo from '../assets/images/IDit.png';

function Navbar({ currentPage }) {
	return (
		<header className="site-header">
			<a className="site-logo" href="#editor" aria-label="Open IDit editor">
				<img src={logo} alt="IDit" />
			</a>

			<nav className="site-nav" aria-label="Main navigation">
				<a className={`site-nav-link ${currentPage === 'home' ? 'active' : ''}`} href="#home">
					Home
				</a>
				<a className={`site-nav-link ${currentPage === 'editor' ? 'active' : ''}`} href="#editor">
					Edit
				</a>
				<a className={`site-nav-link ${currentPage === 'about' ? 'active' : ''}`} href="#about">
					About
				</a>
			</nav>
		</header>
	);
}

export default Navbar;
