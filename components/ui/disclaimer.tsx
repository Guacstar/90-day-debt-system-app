export function Disclaimer({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-slate-400 leading-relaxed">
        Educational financial coaching only. Not legal, tax, investment, bankruptcy, credit repair, or debt settlement advice. Results vary.
      </p>
    );
  }
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-600 leading-relaxed">
        <span className="font-semibold">Disclaimer:</span> This app and coaching program provide educational financial coaching only. This is not legal, tax, investment, bankruptcy, credit repair, or debt settlement advice. Results vary based on income, expenses, debt levels, behavior, and client participation.
      </p>
    </div>
  );
}
