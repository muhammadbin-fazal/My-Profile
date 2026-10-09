import React, { useState } from 'react';
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Code2, ExternalLink, Fingerprint, Github, Linkedin, Lock, Mail, Menu, X } from 'lucide-react';
import Galaxy from './Galaxy.jsx';
import RubberSegment from './RubberSegment.jsx';
import BorderGlow from './BorderGlow.jsx';
import LatticeLoader from './LatticeLoader.jsx';

const projects = [
  {
    number: '01',
    title: 'Cross-Shell LLM Assistant',
    type: 'Python · Ollama · CLI',
    description: 'A terminal-based assistant powered by an 8-billion-parameter LLaMA model, built to offer natural-language command help across Linux, Windows, and multiple shells.',
    mark: '01 / SYSTEMS',
  },
  {
    number: '02',
    title: 'Beck Anxiety Inventory Calculator',
    type: 'Python · Tkinter · GUI',
    description: 'A desktop questionnaire that records responses and automatically scores them to estimate anxiety severity levels.',
    mark: '02 / APPLICATION',
  },
  {
    number: '03',
    title: 'Hangman Game',
    type: 'Python · GUI',
    description: 'A graphical word-guessing game with win and loss states, game logic, and replayability.',
    mark: '03 / LOGIC',
  },
];

const skillGroups = [
  { label: 'Languages', values: 'Python, C++, Java, JavaScript, HTML / CSS, React/Next.js, MongoDB' },
  { label: 'Foundations', values: 'OOP, data structures & algorithms, discrete structures' },
  { label: 'Tools & systems', values: 'Git, GitHub, VS Code, Tkinter, Ollama, Linux, Windows' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [loaderPhase, setLoaderPhase] = useState('working');
  const sectionScrollTimer = React.useRef(null);
  const sectionScrollFrame = React.useRef(null);
  const closeMenu = () => setMenuOpen(false);
  const navigateToSection = (section) => {
    setActiveSection(section);
    closeMenu();
    window.history.pushState(null, '', `#${section}`);
    window.clearTimeout(sectionScrollTimer.current);
    if (sectionScrollFrame.current !== null) window.cancelAnimationFrame(sectionScrollFrame.current);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollToSection = () => {
      const target = document.getElementById(section);
      if (!target) return;
      const startY = window.scrollY;
      const targetY = startY + target.getBoundingClientRect().top;
      const scrollingElement = document.scrollingElement || document.documentElement;
      if (reducedMotion) {
        scrollingElement.scrollTop = targetY;
        return;
      }
      const startTime = performance.now();
      const duration = 680;
      const animateScroll = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        scrollingElement.scrollTop = startY + (targetY - startY) * eased;
        if (progress < 1) sectionScrollFrame.current = window.requestAnimationFrame(animateScroll);
        else sectionScrollFrame.current = null;
      };
      sectionScrollFrame.current = window.requestAnimationFrame(animateScroll);
    };
    if (reducedMotion) scrollToSection();
    else sectionScrollTimer.current = window.setTimeout(scrollToSection, 100);
  };

  React.useEffect(() => {
    const startedAt = performance.now();
    let finished = false;
    let loadFallback;
    let readyTimer;
    let exitTimer;
    let removeTimer;
    const finishLoading = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(loadFallback);
      const remaining = Math.max(0, 650 - (performance.now() - startedAt));
      readyTimer = window.setTimeout(() => {
        setLoaderPhase('done');
        exitTimer = window.setTimeout(() => setLoaderPhase('exit'), 300);
        removeTimer = window.setTimeout(() => setLoaderPhase('hidden'), 600);
      }, remaining);
    };
    loadFallback = window.setTimeout(finishLoading, 4000);
    if (document.readyState === 'complete') finishLoading();
    else window.addEventListener('load', finishLoading, { once: true });

    const syncSection = () => {
      const section = window.location.hash.slice(1);
      setActiveSection(['about', 'projects', 'experience'].includes(section) ? section : 'about');
    };
    window.addEventListener('popstate', syncSection);
    syncSection();
    return () => {
      window.removeEventListener('load', finishLoading);
      window.removeEventListener('popstate', syncSection);
      window.clearTimeout(loadFallback);
      window.clearTimeout(readyTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(sectionScrollTimer.current);
      if (sectionScrollFrame.current !== null) window.cancelAnimationFrame(sectionScrollFrame.current);
    };
  }, []);

  return (
    <>
    {loaderPhase !== 'hidden' && (
      <div className={`site-loader${loaderPhase === 'exit' ? ' site-loader--exit' : ''}`} aria-live="polite">
        <div className="site-loader__content">
          <span className="site-loader__brand">MBF<span>.</span></span>
          <LatticeLoader
            status={loaderPhase === 'working' ? 'working' : 'done'}
            label="Loading portfolio"
            doneLabel="Ready"
            errorLabel="Unable to load"
            pattern="orbit"
            grid={3}
            shape="round"
            color="#d8d4dc"
            doneColor="#ed3c9e"
            errorColor="#ed3c9e"
            cellSize={7}
            gap={3}
            fontSize={14}
            step={90}
            idleOpacity={0.16}
            glow
            glowColor="#ed3c9e"
            showTimer
          />
          <span className="site-loader__caption">SOFTWARE ENGINEERING · ISLAMABAD</span>
        </div>
      </div>
    )}
    <main className="portfolio" id="top" aria-hidden={loaderPhase !== 'hidden' ? 'true' : undefined}>
      <header className={`pf-header ${menuOpen ? 'menu-open' : ''}`}>
        <a className="pf-brand" href="#top" aria-label="Muhammad Bin Fazal, home">MBF<span>.</span></a>
        <button className="pf-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`pf-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <RubberSegment
            items={[{ value: 'about', label: 'About' }, { value: 'projects', label: 'Projects' }, { value: 'experience', label: 'Experience' }]}
            value={activeSection}
            onChange={navigateToSection}
            trackColor="#171519"
            thumbColor="#ed3c9e"
            textColor="#d0cad3"
            activeTextColor="#170d15"
            equalSlots={false}
            size="sm"
            radius={999}
            inset={3}
            aria-label="Portfolio sections"
          />
          <a className="pf-nav-contact" href="mailto:muhammadbinfazal10@email.com" onClick={closeMenu}>Get in touch <ArrowUpRight size={14} /></a>
        </nav>
      </header>

      <section className="pf-hero" aria-labelledby="intro-title">
        <Galaxy
          className="pf-hero-galaxy"
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
        <div className="pf-hero-copy">
          <p className="pf-kicker"><span /> Software Engineering · Islamabad, Pakistan</p>
          <h1 id="intro-title">Muhammad<br /><em>Bin Fazal</em></h1>
          <p className="pf-intro">Software Engineering student drawn to cybersecurity and systems-level programming. I build practical tools that make technology a little more useful and understandable.</p>
          <div className="pf-hero-actions">
            <a className="pf-primary-link" href="#projects">Explore my work <ArrowDown size={15} /></a>
            <a className="pf-text-link" href="mailto:muhammadbinfazal10@email.com">Contact me <ArrowUpRight size={15} /></a>
          </div>
          <div className="pf-socials" aria-label="Social links">
            <a href="https://github.com/muhammad-bin-fazal" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
            <a href="www.linkedin.com/in/muhammad-bin-fazal-2b842b37a

" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
            <a href="mailto:muhammadbinfazal10@email.com" aria-label="Email"><Mail size={17} /></a>
          </div>
        </div>
        <div className="pf-hero-art" aria-label="A starfield with a sample of cross-shell assistant code">
          <div className="pf-code-window" aria-hidden="true">
            <div className="pf-window-top"><span /><span /><span /><b>cross_shell_assistant.py</b></div>
            <pre><code><i>01</i> <span>def</span> <strong>assist</strong>(command):<br /><i>02</i>   prompt = <em>"Explain this command"</em><br /><i>03</i>   <span>return</span> ollama.chat(prompt)<br /><i>04</i><br /><i>05</i> <small># Linux · Windows · shells</small></code></pre>
          </div>
          <div className="pf-image-note"><Code2 size={14} /> Curious by nature. Practical by design.</div>
          <span className="pf-art-index">01 — 03</span>
        </div>
        <a className="pf-scroll-cue" href="#about" aria-label="Scroll to about"><span /> Scroll to explore</a>
      </section>

      <section className="pf-about pf-section" id="about">
        <div className="pf-section-label"><span>01</span> / A LITTLE ABOUT ME</div>
        <div className="pf-about-content">
          <h2>Learning how<br />things <em>work.</em></h2>
          <div className="pf-about-copy">
            <p>I’m studying Software Engineering at Bahria University, H-11 Campus. I enjoy moving between programming fundamentals and hands-on projects, especially where software meets operating systems, automation, and security.</p>
            <p>My work so far includes command-line AI tools and small GUI applications. Along the way, client-facing and freelance work have also helped me grow as a communicator and independent problem-solver.</p>
            <a className="pf-inline-link" href="https://muhammad-bin-fazal.github.io" target="_blank" rel="noreferrer">Visit my website <ExternalLink size={14} /></a>
          </div>
        </div>
        <div className="pf-education"><span className="pf-education-mark">BU</span><div><strong>Bahria University, H-11 Campus</strong><span>Bachelor of Software Engineering · 2025–Present</span></div><span className="pf-education-place">Islamabad, Pakistan</span></div>
      </section>

      <section className="pf-projects pf-section" id="projects">
        <div className="pf-projects-heading"><div><div className="pf-section-label"><span>02</span> / SELECTED PROJECTS</div><h2>Built to <em>learn.</em></h2></div><p>Small, practical projects exploring AI assistance, application logic, and desktop interfaces.</p></div>
        <div className="pf-project-grid">
          {projects.map((project) => <BorderGlow key={project.number} className="pf-project-frame" glowColor="340 35 78" backgroundColor="#111013" borderRadius={8} glowRadius={24} glowIntensity={0.9} colors={['#c0c0c0', '#ed3c9e', '#f4f1f5']} animated>
            <article className="pf-project">
              <div className="pf-project-top"><span className="pf-project-number">{project.number}</span><span className="pf-project-mark">{project.mark}</span></div>
              <div className="pf-project-main"><span className="pf-project-type">{project.type}</span><h3>{project.title}</h3><p>{project.description}</p></div>
              <a className="pf-project-arrow" href="https://github.com/muhammad-bin-fazal" target="_blank" rel="noreferrer" aria-label={`Visit Muhammad Bin Fazal's GitHub profile from ${project.title}`}><ArrowUpRight size={19} /></a>
            </article>
          </BorderGlow>)}
        </div>
        <a className="pf-inline-link pf-github-link" href="https://github.com/muhammad-bin-fazal" target="_blank" rel="noreferrer">More on GitHub <ArrowRight size={15} /></a>
      </section>

      <section className="pf-skills pf-section" aria-labelledby="skills-title">
        <div className="pf-section-label"><span>03</span> / CURRENT TOOLKIT</div>
        <div className="pf-skills-content">
          <div className="pf-skills-heading"><h2 id="skills-title">A growing<br /><em>toolkit.</em></h2><p>Curiosity across code, systems, and security.</p></div>
          <BorderGlow className="pf-toolkit-card" glowColor="340 35 78" backgroundColor="#111013" borderRadius={8} glowRadius={24} glowIntensity={0.9} colors={['#c0c0c0', '#ed3c9e', '#f4f1f5']} animated>
            <article className="pf-toolkit-profile">
              <div className="pf-toolkit-top"><span className="pf-toolkit-badge"><Lock size={13} /> SYSTEMS & SECURITY</span><Activity size={19} className="pf-toolkit-status" aria-label="Current focus" /></div>
              <div className="pf-toolkit-identity"><span className="pf-toolkit-overline">SOFTWARE ENGINEERING STUDENT</span><h3>Muhammad Bin Fazal</h3><p>Bahria University · Islamabad</p></div>
              <div className="pf-toolkit-details">
                <div><span className="pf-toolkit-overline">LANGUAGES</span><p>{skillGroups[0].values}</p></div>
                <div><span className="pf-toolkit-overline">TOOLS & FOUNDATIONS</span><p>{skillGroups[1].values} · {skillGroups[2].values}</p></div>
                <div><span className="pf-toolkit-overline">EXPLORING</span><p>Cybersecurity fundamentals · Cross-platform scripting · Applied AI</p></div>
                <Fingerprint size={31} className="pf-toolkit-fingerprint" aria-hidden="true" />
              </div>
            </article>
          </BorderGlow>
        </div>
      </section>

      <section className="pf-experience pf-section" id="experience">
        <div className="pf-section-label"><span>04</span> / EXPERIENCE</div>
        <div className="pf-experience-list">
          <article className="pf-experience-item"><span className="pf-experience-type">ON-SITE · SALES</span><div><h3>Sales Agent</h3><strong>Outright</strong><p>Made outbound calls to generate and qualify leads, explaining offerings and building clear, confident client communication.</p></div><span className="pf-experience-date">Professional experience</span></article>
          <article className="pf-experience-item"><span className="pf-experience-type">REMOTE · FREELANCE</span><div><h3>Graphic Designer</h3><strong>Freelance</strong><p>Created social media posters and posts in Canva, delivering consistent visual content while managing client requests independently.</p></div><span className="pf-experience-date">Independent work</span></article>
        </div>
      </section>

      <section className="pf-contact" id="contact"><p className="pf-section-label"><span>05</span> / NEXT CONVERSATION</p><h2>Let’s make<br /><em>something useful.</em></h2><a className="pf-contact-link" href="mailto:muhammadbinfazal10@email.com">muhammadbinfazal10@email.com <ArrowUpRight size={18} /></a><span className="pf-contact-decoration">MBF</span></section>

      <footer className="pf-footer"><a className="pf-brand" href="#top">MBF<span>.</span></a><span>Software Engineering · Islamabad</span><div><a href="https://github.com/muhammad-bin-fazal" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/muhammad-bin-fazal" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:muhammadbinfazal10@email.com">Email</a></div><span>© 2026 Muhammad Bin Fazal</span></footer>
    </main>
    </>
  );
}

export default App;
