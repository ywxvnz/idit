import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import logo from '../assets/images/IDit.png';

function Home({ onCreate }) {
  const [activeNavLink, setActiveNavLink] = useState(
    window.location.hash === '#how-it-works' ? 'how-it-works' : null,
  );

  return (
    <main className="home-page">
      <Navbar activeLink={activeNavLink} setActiveLink={setActiveNavLink} currentPage="home" isHome />

      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">ID + edit</p>
          <h1 id="hero-title">IDit your way.</h1>
          <p className="hero-description">Crop, resize, add a nametag, and choose a template for your ID photos for printing, all in one place.</p>
          <button className="primary-button" type="button" onClick={onCreate}>Create your ID photo <span aria-hidden="true">↗</span></button>
        </div>
        <div className="hero-logo-lockup" aria-label="IDit your way">
          <img src={logo} alt="IDit" />
          <span>your photo, your way</span>
        </div>
      </section>

      <section className="home-section capability-section" id="what-idit-can-do" aria-labelledby="capability-title">
        <div className="section-heading">
          <p className="eyebrow">What IDit can do</p>
          <h2 id="capability-title">Everything you need<br />for your ID photo.</h2>
        </div>
        <div className="capability-grid">
          <article><span className="feature-number">01</span><h3>Photo editing</h3><p>Crop &amp; resize</p></article>
          <article><span className="feature-number">02</span><h3>Nametag</h3><p>Add your name</p></article>
          <article><span className="feature-number">03</span><h3>Print layouts</h3><p>Choose a template</p></article>
          <article><span className="feature-number">04</span><h3>Easy to use</h3><p>Simple workflow</p></article>
        </div>
      </section>

      <section className="home-section steps-section" id="how-it-works" aria-labelledby="steps-title">
        <div className="section-heading steps-heading">
          <p className="eyebrow">How it works</p>
          <h2 id="steps-title">From photo to print<br />in four simple moves.</h2>
        </div>
        <div className="workflow-block">
          <p className="workflow-label">01 / Photo editing</p>
          <div className="step-row"><span className="workflow-step">01</span><span className="workflow-step">02</span><span className="workflow-step">03</span><span className="workflow-step">04</span></div>
          <div className="step-row step-names"><span className="workflow-name">Upload</span><span className="workflow-name">Customize</span><span className="workflow-name">Edit</span><span className="workflow-name">Print</span></div>
        </div>
        <div className="workflow-block print-workflow">
          <p className="workflow-label">02 / Print layout</p>
          <div className="step-row"><span className="workflow-step">01</span><span className="workflow-step">02</span><span className="workflow-step">03</span><span className="workflow-step">04</span></div>
          <div className="step-row step-names"><span className="workflow-name">Upload</span><span className="workflow-name">Choose</span><span className="workflow-name">Check</span><span className="workflow-name">Print</span></div>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <p className="eyebrow">ID + edit</p>
        <h2 id="cta-title">Get your ID photo ready,<br /><em>your way.</em></h2>
        <p>Prepare. Customize. Print.</p>
        <button className="primary-button light-button" type="button" onClick={onCreate}>Create your ID photo <span aria-hidden="true">↗</span></button>
      </section>

      <Footer />
    </main>
  );
}

export default Home;