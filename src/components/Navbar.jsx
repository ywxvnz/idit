import logo from '../assets/images/IDit.png';

function Navbar({ activeLink, setActiveLink, currentPage, isHome = false }) {
	return (
		<header className="site-header">
			<a className={`site-logo ${currentPage === 'editor' ? 'active' : ''}`} href="#editor" aria-label="Open IDit editor">
				<img src={logo} alt="IDit" />
			</a>

			<nav className="site-nav" aria-label="Main navigation">
				<a
					className={`site-nav-link ${activeLink === 'how-it-works' ? 'active' : ''}`}
					href={isHome ? '#how-it-works' : '/#how-it-works'}
					onClick={() => setActiveLink('how-it-works')}
				>
					How it works
				</a>
				<a
					className={`site-nav-link ${currentPage === 'about' || activeLink === 'about' ? 'active' : ''}`}
					href="#about"
					onClick={() => setActiveLink('about')}
				>
					About
				</a>
			</nav>
		</header>
	);
}

export default Navbar;
