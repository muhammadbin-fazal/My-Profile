'use client';

import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clapperboard,
  Film,
  Instagram,
  Mail,
  Menu,
  Play,
  Send,
  X,
} from 'lucide-react';
import Galaxy from '../src/Galaxy.jsx';

const emailAddress = 'hello@frameform.studio';

const projects = [
  {
    number: '01',
    name: 'After Hours',
    type: 'BRAND FILM · 01:24',
    className: 'project-art--amber',
    caption: 'A little less ordinary.',
    shape: 'sunset',
  },
  {
    number: '02',
    name: 'Made of Motion',
    type: 'SOCIAL CAMPAIGN · 00:38',
    className: 'project-art--blue',
    caption: 'Find your own pace.',
    shape: 'motion',
  },
  {
    number: '03',
    name: 'The Long Way',
    type: 'MINI DOCUMENTARY · 04:16',
    className: 'project-art--rose',
    caption: 'Somewhere worth going.',
    shape: 'journey',
  },
];

const services = [
  {
    number: '01',
    title: 'Brand films',
    description:
      'Cinematic, story-led edits that make people feel something about your brand.',
    detail: 'CAMPAIGNS · LAUNCHES · ABOUT FILMS',
  },
  {
    number: '02',
    title: 'Social content',
    description:
      'Platform-native edits built to catch a thumb, keep attention, and earn a replay.',
    detail: 'REELS · SHORTS · TIKTOK',
  },
  {
    number: '03',
    title: 'Creator edits',
    description:
      'Your footage, your voice—shaped into a consistent style your audience knows.',
    detail: 'YOUTUBE · PODCASTS · VLOGS',
  },
  {
    number: '04',
    title: 'Post-production',
    description:
      'The thoughtful finishing touches: color, sound, titles, and delivery in every format.',
    detail: 'COLOR · SOUND · MOTION · DELIVERY',
  },
];

function ProjectArtwork({ project }) {
  return (
    <div className={`project-art ${project.className}`} aria-hidden="true">
      <div className={`art-object art-object--${project.shape}`}>
        <span />
        <span />
        <span />
      </div>
      <div className="art-grain" />
      <div className="art-play"><Play size={14} fill="currentColor" /></div>
      <span className="art-caption">{project.caption}</span>
      <span className="art-duration">4K · 24 FPS</span>
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);

  function sendEmail(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const project = formData.get('project');
    const message = formData.get('message');
    const subject = `New project enquiry from ${name}`;
    const body = `Name: ${name}\nProject: ${project}\n\n${message}`;

    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form className="contact-form" onSubmit={sendEmail}>
      <label>
        YOUR NAME
        <input name="name" type="text" placeholder="The name we should know" required />
      </label>
      <label>
        WHAT ARE YOU MAKING?
        <select name="project" defaultValue="" required>
          <option value="" disabled>Select a project type</option>
          <option>Brand film</option>
          <option>Social content</option>
          <option>Creator edits</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="contact-message">
        A LITTLE ABOUT IT
        <textarea name="message" placeholder="The idea, the timeline, the feeling..." rows="3" required />
      </label>
      <div className="form-submit-row">
        <p>{sent ? <><Check size={14} /> Your email app should be opening.</> : 'NO BRIEF IS TOO EARLY.'}</p>
        <button className="button button--light" type="submit">
          Send an enquiry <Send size={15} />
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const stageSceneRef = useRef(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  function moveStage(event) {
    if (event.pointerType !== 'mouse' || !stageSceneRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    stageSceneRef.current.style.setProperty('--tilt-x', `${x * 7}deg`);
    stageSceneRef.current.style.setProperty('--tilt-y', `${y * -7}deg`);
  }

  function resetStage() {
    if (!stageSceneRef.current) return;
    stageSceneRef.current.style.setProperty('--tilt-x', '0deg');
    stageSceneRef.current.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Frameform Studio home" onClick={closeMenu}>
          <span className="wordmark-icon"><Clapperboard size={17} strokeWidth={1.8} /></span>
          <span>frameform<span className="wordmark-period">.</span></span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>Selected work</a>
          <a href="#services" onClick={closeMenu}>What we do</a>
          <a href="#about" onClick={closeMenu}>Studio</a>
          <a className="nav-email" href={`mailto:${emailAddress}`} onClick={closeMenu}>
            <Mail size={14} /> Email
          </a>
          <a className="nav-contact" href="#contact" onClick={closeMenu}>
            Let&apos;s talk <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <Galaxy
          className="hero-galaxy"
          mouseRepulsion
          mouseInteraction
          density={1.8}
          glowIntensity={0.9}
          saturation={1}
          hueShift={290}
          twinkleIntensity={0.7}
          rotationSpeed={0.08}
          repulsionStrength={3}
          starSpeed={0.18}
          speed={0.7}
        />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> INDEPENDENT VIDEO EDITING STUDIO</p>
          <h1 id="hero-title">Good stories<br />deserve a <em>better cut.</em></h1>
          <p className="hero-description">
            We turn raw footage into videos people actually want to watch. Thoughtful edits for brands, creators, and ideas with somewhere to go.
          </p>
          <div className="hero-actions">
            <a className="button button--lime" href="#work">See what we make <ArrowDownRight size={16} /></a>
            <a className="hero-email" href={`mailto:${emailAddress}`}>Have a project? <span>Tell us about it <ArrowUpRight size={13} /></span></a>
          </div>
          <div className="hero-footnote"><span>01 / 04</span><span className="hero-footnote-rule" /><span>STORY FIRST. ALWAYS.</span></div>
        </div>

        <div className="hero-stage" role="group" aria-label="Interactive three-dimensional video editing reel illustration" onPointerMove={moveStage} onPointerLeave={resetStage}>
          <div className="stage-scene" ref={stageSceneRef}>
            <div className="stage-glow" />
            <div className="orbit orbit--one" />
            <div className="orbit orbit--two" />
            <div className="stage-cube" aria-hidden="true">
              <span className="stage-cube__face stage-cube__face--front">FF</span>
              <span className="stage-cube__face stage-cube__face--back" />
              <span className="stage-cube__face stage-cube__face--right" />
              <span className="stage-cube__face stage-cube__face--left" />
              <span className="stage-cube__face stage-cube__face--top" />
              <span className="stage-cube__face stage-cube__face--bottom" />
            </div>
            <div className="stage-reel">
              <div className="reel-face">
                <div className="reel-center"><span>F</span></div>
                <span className="reel-hole reel-hole--one" />
                <span className="reel-hole reel-hole--two" />
                <span className="reel-hole reel-hole--three" />
                <span className="reel-hole reel-hole--four" />
                <span className="reel-rim" />
              </div>
            </div>
            <div className="floating-frame floating-frame--top">
              <div className="frame-sky"><span className="frame-sun" /><span className="frame-mountain frame-mountain--back" /><span className="frame-mountain frame-mountain--front" /></div>
              <span className="frame-label"><span className="live-dot" /> COLOR GRADE · 01</span>
            </div>
            <div className="floating-frame floating-frame--bottom">
              <div className="frame-water"><span /><span /><span /><span /></div>
              <span className="frame-label">TAKE 03 <span>00:18</span></span>
            </div>
            <div className="stage-badge"><Film size={15} /><span>MADE TO<br />MOVE YOU</span></div>
            <a className="stage-email-card" href={`mailto:${emailAddress}`}>
              <span className="stage-email-card__icon"><Mail size={15} /></span>
              <span><small>HAVE A PROJECT?</small><strong>Let&apos;s talk</strong></span>
              <ArrowUpRight size={14} />
            </a>
            <div className="stage-caption">A FRAME IS A FEELING.</div>
          </div>
        </div>
        <a href="#work" className="scroll-cue"><ArrowDown size={14} /> SCROLL TO EXPLORE</a>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="section-topline">
          <p className="eyebrow"><span className="section-index">01</span> THE REEL</p>
          <p className="section-aside">A FEW THINGS WE&apos;VE BEEN CUTTING</p>
        </div>
        <div className="section-heading">
          <h2>Less scroll.<br /><em>More feeling.</em></h2>
          <p>Every edit starts with a feeling worth sharing. Here&apos;s a look at what that can become.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <ProjectArtwork project={project} />
              <div className="project-info">
                <div><span className="project-type">{project.type}</span><h3>{project.name}</h3></div>
                <span className="project-number">{project.number} <ArrowUpRight size={15} /></span>
              </div>
            </article>
          ))}
        </div>
        <p className="work-note"><span className="live-dot" /> SELECTED WORK — 2024 / 2026 <span className="work-note-line" /> MORE GOOD THINGS IN THE EDIT.</p>
      </section>

      <section className="services-section" id="services">
        <div className="section-wrap">
          <div className="section-topline">
            <p className="eyebrow"><span className="section-index">02</span> THE CRAFT</p>
            <p className="section-aside">FROM FIRST CUT TO FINAL FRAME</p>
          </div>
          <div className="services-intro">
            <h2>All the right<br /><em>moving parts.</em></h2>
            <p>Good post-production is more than a timeline. It&apos;s knowing what to leave in, what to take out, and when to let a moment breathe.</p>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <article className="service-row" key={service.number}>
                <span className="service-number">{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-detail">{service.detail}</span>
                <ArrowUpRight className="service-arrow" size={18} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section section-wrap" id="about">
        <div className="about-stamp" aria-hidden="true">
          <div className="stamp-ring"><span>FRAMEFORM STUDIO · MADE WITH INTENTION · </span></div>
          <div className="stamp-core"><Clapperboard size={30} strokeWidth={1.2} /></div>
        </div>
        <div className="about-copy">
          <p className="eyebrow"><span className="section-index">03</span> A SMALL STUDIO WITH A BIG PICTURE</p>
          <h2>We believe the<br />edit is where the<br /><em>magic happens.</em></h2>
          <p className="about-description">We&apos;re an independent editing studio built around one simple idea: the right cut can make you laugh, lean in, or see something differently. We work closely, move thoughtfully, and care about every frame.</p>
          <a className="text-link" href="#contact">A little more about working together <ArrowRight size={15} /></a>
        </div>
        <div className="about-side-note"><span>INDEPENDENT BY NATURE</span><span className="about-note-rule" /><span>COLLABORATIVE BY DESIGN</span></div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-inner section-wrap">
          <div className="contact-heading">
            <p className="eyebrow"><span className="section-index">04</span> YOUR TURN</p>
            <h2>Got a story?<br /><em>Let&apos;s make it move.</em></h2>
            <p>Tell us what you&apos;re working on. We&apos;ll bring the edit brain, you bring the big idea.</p>
            <a className="contact-email" href={`mailto:${emailAddress}`}>{emailAddress} <ArrowUpRight size={15} /></a>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="site-footer section-wrap">
        <a className="wordmark" href="#top" aria-label="Frameform Studio home">
          <span className="wordmark-icon"><Clapperboard size={16} strokeWidth={1.8} /></span>
          <span>frameform<span className="wordmark-period">.</span></span>
        </a>
        <p>INDEPENDENT VIDEO EDITING STUDIO</p>
        <div className="footer-links">
          <a href={`mailto:${emailAddress}`}>EMAIL <ArrowUpRight size={12} /></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">INSTAGRAM <Instagram size={12} /></a>
        </div>
        <span className="copyright">© 2026 FRAMEFORM STUDIO</span>
      </footer>
    </main>
  );
}
