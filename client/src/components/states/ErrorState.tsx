interface Props {
  message?: string;
}

export default function ErrorState({
  message = "Unable to load data",
}: Props) {
  return (
    <div className="error-state">
      <h3>Error</h3>
      <p>{message}</p>
    </div>
  );
}
