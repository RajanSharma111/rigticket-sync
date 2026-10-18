// ============================================================================
// Formatting helpers
// ============================================================================
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = diff / 3600_000;
  if (hrs < 1) return `${Math.max(1, Math.round(hrs * 60))}m ago`;
  if (hrs < 24) return `${hrs.toFixed(1)}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
