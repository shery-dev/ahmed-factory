'use client';
export function PrintButton({ label = 'Print Receipt' }: { label?: string }) {
  return (
    <button className="btn btn-primary no-print" style={{ marginTop: 16 }}
            onClick={() => window.print()}>
      {label}
    </button>
  );
}
