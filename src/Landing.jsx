import React from 'react';
import { ShieldCheck, Zap, Radar, ArrowRight } from 'lucide-react';
import './Landing.css';

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Prevent wallet drain',
    text: 'Real-time policy checks block suspicious transactions before users sign.'
  },
  {
    icon: Radar,
    title: 'AI risk scoring',
    text: 'Behavioral and on-chain signals are combined into clear, actionable risk grades.'
  },
  {
    icon: Zap,
    title: 'Fast integration',
    text: 'Connect your flow in minutes with REST APIs and extension-ready hooks.'
  }
];

export function Landing() {
  return (
    <div className="landing-page">
      <div className="landing-glow landing-glow-a" aria-hidden="true" />
      <div className="landing-glow landing-glow-b" aria-hidden="true" />

      <header className="landing-header">
        <div className="landing-brand">Guardian</div>
        <nav className="landing-nav">
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <a href="#demo">Demo</a>
        </nav>
        <a href="/app" className="landing-btn landing-btn-ghost">Open App</a>
      </header>

      <main className="landing-main">
        <section className="hero" id="demo">
          <p className="hero-kicker">SOLANA SECURITY LAYER</p>
          <h1>Stop risky transactions before they drain your users.</h1>
          <p className="hero-copy">
            Guardian is a security firewall for wallets, dApps, and operators.
            Detect threats, auto-block malicious actions, and increase user trust.
          </p>
          <div className="hero-ctas">
            <a href="/app/demo" className="landing-btn landing-btn-primary">
              Watch Live Demo
              <ArrowRight size={16} />
            </a>
            <a href="/app" className="landing-btn landing-btn-ghost">Launch Dashboard</a>
          </div>
        </section>

        <section className="highlights" id="product">
          {highlights.map(({ icon: Icon, title, text }) => (
            <article key={title} className="highlight-card">
              <Icon size={20} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="pricing" id="pricing">
          <div className="pricing-copy">
            <p className="hero-kicker">PRICING</p>
            <h2>Simple plan for teams shipping serious Web3 products.</h2>
            <p>Start with pilot integration, then scale by transaction volume.</p>
          </div>
          <div className="pricing-card">
            <p className="plan-name">Growth</p>
            <p className="plan-price">$799<span>/month</span></p>
            <ul>
              <li>Up to 500k transaction checks</li>
              <li>AI threat scoring + policy engine</li>
              <li>Dashboard, alerts, and audit logs</li>
              <li>Priority support</li>
            </ul>
            <a href="/app/settings" className="landing-btn landing-btn-primary">Start Pilot</a>
          </div>
        </section>
      </main>
    </div>
  );
}
