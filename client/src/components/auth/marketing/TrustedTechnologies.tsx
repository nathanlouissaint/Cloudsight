const technologies = [
  "AWS",
  "Docker",
  "Terraform",
  "PostgreSQL",
];

export default function TrustedTechnologies() {
  return (
    <div className="auth-technologies">
      <p className="auth-technologies__label">
        Built for modern cloud teams
      </p>

      <div className="auth-technologies__list">
        {technologies.map((technology) => (
          <span key={technology}>
            {technology}
          </span>
        ))}
      </div>
    </div>
  );
}
