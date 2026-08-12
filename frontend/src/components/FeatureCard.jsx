export default function FeatureCard({ mark, title, text }) {
  return (
    <article className="feature-card">
      <div className="mark">{mark}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
