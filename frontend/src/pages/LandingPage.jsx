import FeatureCard from "../components/FeatureCard.jsx";

export default function LandingPage({ onLogin }) {
  return (
    <>
      <header className="landing-navbar">
        <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="nav-brand-text">SmarterTasking</span>
        </button>
        <nav className="landing-links">
          <a href="#modules">Modules</a>
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
        </nav>
        <div className="landing-actions">
          <button className="btn-ghost" onClick={onLogin}>Log in</button>
          <button className="btn-primary" onClick={onLogin}>Get started</button>
        </div>
      </header>

      <main className="landing-page">
        <section className="landing-hero">
          <div className="landing-wrap">
            <div className="hero-frame framed">
              <div className="titleblock">
                <div className="titleblock-item">
                  <span className="eyebrow">Focus</span>
                  <span className="val">Task clarity</span>
                </div>
                <div className="titleblock-item">
                  <span className="eyebrow">Planning</span>
                  <span className="val">Daily + periodic</span>
                </div>
                <div className="titleblock-item">
                  <span className="eyebrow">Storage</span>
                  <span className="val">Notes + code</span>
                </div>
                <div className="titleblock-item">
                  <span className="eyebrow">Status</span>
                  <span className="val"><span className="status-dot"></span>Ready</span>
                </div>
              </div>

              <div className="hero-body">
                <div className="hero-copy">
                  <span className="eyebrow">Personal task management</span>
                  <h1>A clean desk<br />for every task.</h1>
                  <p>
                    SmarterTasking helps you plan today's work, track deadline-based tasks,
                    keep useful notes and code snippets nearby, and review what you finished
                    without digging through scattered lists.
                  </p>
                  <p className="creator-credit">
                    Created by{" "}
                    <a href="https://vishvashahportfolio.vercel.app/portfolio.html" target="_blank" rel="noreferrer">
                      VISHVA SHAH
                    </a>
                  </p>
                  <div className="hero-actions">
                    <button className="btn-primary" onClick={onLogin}>Get started</button>
                    <a href="#workflow" className="btn-ghost">See how it works</a>
                  </div>
                </div>
                <div className="hero-stats">
                  <div className="stat-chip">
                    <span className="label">Plan</span>
                    <span className="num">Daily</span>
                  </div>
                  <div className="stat-chip">
                    <span className="label">Schedule</span>
                    <span className="num">Periodic</span>
                  </div>
                  <div className="stat-chip">
                    <span className="label">Review</span>
                    <span className="num">History</span>
                  </div>
                  <div className="stat-chip">
                    <span className="label">Save</span>
                    <span className="num">Notes + Codes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="landing-section">
          <div className="landing-wrap">
            <div className="section-head">
              <span className="eyebrow">Workspace layout</span>
              <h2>Everything has a place.</h2>
              <p>
                Separate daily work from longer-running responsibilities, then keep completed
                and missed tasks in a simple history view for review.
              </p>
            </div>

            <div className="schematic-grid">
              <FeatureCard mark="D" title="Daily board" text="Use it for the work you want to clear today. Add a task, finish it, or remove it when it no longer matters." />
              <FeatureCard mark="P" title="Periodic board" text="Use it for tasks with a date or deadline, so scheduled work does not get mixed into today's quick list." />
              <FeatureCard mark="H" title="History ledger" text="Completed and missed work is kept separately, with filters that make it easier to understand your progress." />
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-wrap">
            <div className="section-head">
              <span className="eyebrow">Features</span>
              <h2>Built for everyday follow-through.</h2>
              <p>SmarterTasking keeps the daily workflow small, direct, and easy to return to.</p>
            </div>
            <div className="feature-grid">
              <FeatureCard mark="01" title="Create and complete tasks" text="Capture task titles and notes, then mark work complete when it is done." />
              <FeatureCard mark="02" title="Track deadlines" text="Add periodic tasks with optional dates so important work stays visible." />
              <FeatureCard mark="03" title="Review task history" text="Filter past work by daily or periodic tasks and by completed or missed status." />
              <FeatureCard mark="04" title="Keep notes and snippets" text="Save reference notes and reusable code snippets beside the same work system." />
            </div>
          </div>
        </section>

        <section className="workflow landing-section" id="workflow">
          <div className="landing-wrap">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>Move from plan to proof.</h2>
            </div>
            <div className="workflow-steps">
              <div className="workflow-step">
                <span className="n">01</span>
                <h3>Plan the work</h3>
                <p>Add today's tasks to Daily and scheduled tasks to Periodic.</p>
              </div>
              <div className="workflow-step">
                <span className="n">02</span>
                <h3>Work the list</h3>
                <p>Complete tasks as you finish them and keep useful details in notes or snippets.</p>
              </div>
              <div className="workflow-step">
                <span className="n">03</span>
                <h3>Review progress</h3>
                <p>Use History and Profile to see what is active, completed, and stored.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-wrap">
            <div className="cta-frame">
              <div>
                <span className="eyebrow">Ready</span>
                <h2>Start today's list.</h2>
              </div>
              <div className="cta-meta">
                <div className="titleblock-item">
                  <span className="eyebrow">Use for</span>
                  <span className="val">Tasks</span>
                </div>
                <div className="titleblock-item">
                  <span className="eyebrow">Keep beside it</span>
                  <span className="val">Notes + code</span>
                </div>
              </div>
              <button className="btn-primary" onClick={onLogin}>Get started</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer landing-wrap">
        <span>
          (c) 2026 SmarterTasking - built by{" "}
          <a href="https://vishvashahportfolio.vercel.app/portfolio.html" target="_blank" rel="noreferrer">
            VISHVA SHAH
          </a>
        </span>
        <span>Plan tasks. Finish work. Review progress.</span>
      </footer>
    </>
  );
}
