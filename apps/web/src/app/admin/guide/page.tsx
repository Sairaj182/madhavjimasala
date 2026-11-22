export const metadata = {
  title: "Admin Guide | Madhavji Masala",
  description: "A quick visual guide for managing the Madhavji Masala General Store.",
};

export default function AdminGuidePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Operations guide</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-gray-900 sm:text-3xl">Run the General Store with confidence</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Use this short walkthrough when you need a refresher on the admin panel, products, orders, and pickup operations.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-brand-gold/25 bg-white shadow-sm">
        <div className="border-b border-brand-border bg-brand-cream/40 px-4 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon">01 · Admin panel walkthrough</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Manage products, store controls, and orders</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Follow the flow shown in the video to move through the admin panel and keep the store ready for customers.
          </p>
        </div>
        <div className="p-3 sm:p-6">
          <figure className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-lg">
            <video
              className="aspect-video w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster="/videos/admin-panel-guide-poster.jpg"
              aria-label="Admin panel walkthrough for Madhavji Masala administrators"
            >
              <source src="/videos/admin-panel-guide.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
            <figcaption className="px-4 py-3 text-xs font-semibold text-white/80 sm:px-5">
              Admin-only walkthrough · Products, store operations, and order management
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Keep products current", "Update availability, packaging, pricing, and product images from Products."],
          ["Review incoming orders", "Use Orders to accept, adjust, and prepare customer requests."],
          ["Verify at pickup", "Ask for the customer pickup code, then complete payment and pickup verification."],
        ].map(([title, detail]) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
