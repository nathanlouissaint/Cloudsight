export function ProgressIndicator({ current, total, category }: { current: number; total: number; category: string }) {
  return <div className="scorecard-progress" aria-label={`Question ${current} of ${total}`}><div><span>{String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}</span><span>{category}</span></div><i><b style={{ width: `${current / total * 100}%` }} /></i></div>;
}
