import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <main className="about-page">
      <Navbar activeLink="about" setActiveLink={() => {}} currentPage="about" isHome={false} />
      <section className="about-content" aria-labelledby="about-title">
        <p className="eyebrow">About IDit</p>
        <h1 id="about-title">ID photos,<br /><em>made simple.</em></h1>
        <div className="about-story">
          <p>IDit is an idea I came up with on September 18, 2026. I had just graduated and was applying for numerous jobs, which meant preparing a lot of documents that required ID pictures.</p>
          <p>That’s when I encountered a problem: resizing and editing ID pictures can be a hassle. I had to figure out which software to use, make sure I was using the right size, and deal with other little things that made the process more complicated than it needed to be.</p>
          <p>I wished there was a website that could do all of these things in one place. Then I thought, "I can make that myself."</p>
          <p>So I did.</p>
          <p>I brought the idea to life by creating IDit - a simple tool for cropping photos to common ID photo sizes used in the Philippines, adding nametags, and choosing from ready-made print layouts.</p>
          <p>What started as a small personal problem became a tool I wanted to make for others who might have the same problem.</p>
          <p className="about-note"><em>P.S. The name “IDit” comes from “ID” + “edit.” It also happens to sound like the Bisaya pronunciation of “edit,” which makes the name a little more personal and fun HAHA.</em></p>
          <p>- v ♡</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default About;