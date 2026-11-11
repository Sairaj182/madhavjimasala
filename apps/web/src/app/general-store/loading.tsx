export default function Loading() {
  return <main className="min-h-screen bg-brand-cream/30 px-4 py-16"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-48 rounded-3xl bg-brand-maroon/20" /><div className="mt-8 h-12 rounded-xl bg-white" /><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/5] rounded-2xl bg-white" />)}</div></div></main>;
}
