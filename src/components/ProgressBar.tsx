type Props = {
  value: number;
  max: number;
  className?: string;
};

export default function ProgressBar({ value, max, className = '' }: Props) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className={`h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-green-400 rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
