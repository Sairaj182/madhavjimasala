"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { isOwnerRole } from "@/lib/admin-roles";

const STATS = [
  { name: "Total Products", value: "Manage", href: "/admin/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "bg-blue-50 text-blue-600" },
  { name: "Total Categories", value: "Manage", href: "/admin/categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z", color: "bg-green-50 text-green-600" },
  { name: "Recent Orders", value: "Manage", href: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "bg-purple-50 text-purple-600" },
  { name: "Time Slots", value: "Manage", href: "/admin/timeslots", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-orange-50 text-orange-600" },
];

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();
  const owner = isOwnerRole(session?.user.role);
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat, idx) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            <Link href={stat.href} className="block group">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-brand-maroon/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to your Admin Portal</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Here you can manage your store&apos;s products, categories, and keep track of incoming customer orders. Use the sidebar to navigate to the specific sections.
        </p>
      </div>

      <section className="mt-12 space-y-6 border-t border-brand-border pt-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Quick operations guide</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-gray-900 sm:text-3xl">Handle every order clearly</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Use the videos and bilingual checklist below when reviewing availability, adjusting fulfillment, and handing an order over at pickup.
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">ઓર્ડર ચકાસવા, ઉપલબ્ધતા બદલવા અને પિકઅપ સમયે ઓર્ડર આપવા માટે નીચેના વીડિયો અને દ્વિભાષી માર્ગદર્શિકાનો ઉપયોગ કરો.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl border border-brand-gold/25 bg-white shadow-sm">
            <div className="border-b border-brand-border bg-brand-cream/40 px-4 py-4 sm:px-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon">01 · Admin panel</p>
              <h3 className="mt-1 text-lg font-bold text-gray-900">Managing products and orders</h3>
              <p className="mt-1 text-sm text-gray-600">એડમિન પેનલમાં પ્રોડક્ટ અને ઓર્ડર મેનેજમેન્ટ.</p>
            </div>
            <div className="p-3 sm:p-4">
              <video
                className="aspect-video w-full rounded-2xl bg-gray-950 object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/videos/admin-panel-guide-poster.jpg"
                aria-label="Admin panel guide for managing products and orders"
              >
                <source src="/videos/admin-panel-guide.mp4" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </figure>

          {owner && <figure className="overflow-hidden rounded-3xl border border-brand-gold/25 bg-white shadow-sm">
            <div className="border-b border-brand-border bg-brand-cream/40 px-4 py-4 sm:px-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon">02 · Pickup desk</p>
              <h3 className="mt-1 text-lg font-bold text-gray-900">Verify a customer pickup</h3>
              <p className="mt-1 text-sm text-gray-600">ગ્રાહકનો પિકઅપ કોડ ચકાસીને ઓર્ડર પૂર્ણ કરો.</p>
            </div>
            <div className="p-3 sm:p-4">
              <video
                className="aspect-video w-full rounded-2xl bg-gray-950 object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/videos/pickup-verification-guide-poster.jpg"
                aria-label="Guide for verifying a customer pickup code"
              >
                <source src="/videos/pickup-verification-guide.mp4" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </figure>}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Order handling</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">Review and confirm</h3>
                <p className="mt-1 text-sm text-gray-500">ઓર્ડર તપાસો અને કન્ફર્મ કરો</p>
              </div>
              <Link href="/admin/orders" className="shrink-0 rounded-full bg-brand-maroon px-3 py-2 text-xs font-bold text-white hover:bg-brand-maroon/90">Open orders</Link>
            </div>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-gray-600">
              <li><strong className="text-gray-900">1. Open the order.</strong> Read the customer request, pickup slot, quantities, and requested packing. <span className="block text-gray-500">ઓર્ડર ખોલો અને ગ્રાહકની માંગ, પિકઅપ સમય, જથ્થો અને પેકિંગ તપાસો.</span></li>
              <li><strong className="text-gray-900">2. Manage shortage or unavailability.</strong> Untick an item that cannot be prepared. Add a clear note such as “100g pouch unavailable” so the customer sees the change. <span className="block text-gray-500">જે વસ્તુ ઉપલબ્ધ ન હોય તેને અનચેક કરો અને કારણ લખો, જેમ કે “100g pouch ઉપલબ્ધ નથી”.</span></li>
              <li><strong className="text-gray-900">3. Choose the actual fulfillment.</strong> Use <em>Serve option</em> to select an available packet or <em>Loose quantity</em> when the product allows it. This supports loose-to-packet and packet-to-loose changes. <span className="block text-gray-500">Serve option માં ઉપલબ્ધ પેકેટ અથવા મંજૂર હોય તો Loose quantity પસંદ કરો. આ loose થી packet અને packet થી loose બદલાવ માટે છે.</span></li>
              <li><strong className="text-gray-900">4. Set a valid total weight.</strong> For packets, choose a packing whose weight divides the requested total into whole packets. For loose items, enter a total weight that produces whole requested units. Add a note for any substitution. <span className="block text-gray-500">પેકેટ માટે કુલ વજનમાંથી પૂરા પેકેટ બને તેવું પેકિંગ પસંદ કરો. Loose માટે પૂરા યુનિટ બને તેવું કુલ ગ્રામ વજન દાખલ કરો. બદલાવ હોય તો નોંધ લખો.</span></li>
              <li><strong className="text-gray-900">5. Confirm preparation.</strong> Confirm the selected items. The order may become partially accepted when one or more requested items are unavailable. <span className="block text-gray-500">પસંદ કરેલી વસ્તુઓ કન્ફર્મ કરો. કોઈ વસ્તુ ઉપલબ્ધ ન હોય તો ઓર્ડર Partially accepted થઈ શકે છે.</span></li>
            </ol>
          </article>

          <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Product setup and pickup</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">Prevent avoidable mistakes</h3>
                <p className="mt-1 text-sm text-gray-500">પ્રોડક્ટ સેટિંગ અને પિકઅપમાં ભૂલ ટાળો</p>
              </div>
              <Link href="/admin/products" className="shrink-0 rounded-full border border-brand-maroon px-3 py-2 text-xs font-bold text-brand-maroon hover:bg-brand-cream">Products</Link>
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-gray-600">
              <li><strong className="text-gray-900">Availability:</strong> Mark an individual packing unavailable instead of deleting the product. Keep at least one valid packing when the product should remain orderable. <span className="block text-gray-500">પ્રોડક્ટ ડિલીટ કરવાને બદલે ચોક્કસ પેકિંગને unavailable કરો. પ્રોડક્ટ વેચવાની હોય તો ઓછામાં ઓછું એક પેકિંગ ઉપલબ્ધ રાખો.</span></li>
              <li><strong className="text-gray-900">Loose selling:</strong> Enable <em>Allow loose quantity</em> only when loose fulfillment is possible, then maintain non-overlapping gram rate bands priced per kilogram. <span className="block text-gray-500">Loose fulfillment શક્ય હોય ત્યારે જ Allow loose quantity ચાલુ કરો અને kg પ્રમાણે, એકબીજા સાથે ન અથડાય તેવા gram rate bands રાખો.</span></li>
              {owner && <li><strong className="text-gray-900">At pickup:</strong> Ask the customer for the 8-character pickup code. Open Orders → Verify pickup, enter the code, and match the order. Give the visible ORD number to staff for handover, then record payment, select Order picked up, and save. <span className="block text-gray-500">ગ્રાહક પાસેથી 8 અક્ષરનો pickup code લો અને Orders → Verify pickup માં ઓર્ડર મેળવો. દેખાતો ORD નંબર staff ને આપો, પછી ચુકવણી નોંધો, Order picked up પસંદ કરો અને Save કરો.</span></li>}
              <li><strong className="text-gray-900">If something is wrong:</strong> Do not guess or expose pickup codes in the order board. Leave the order unchanged, add an explanatory note where applicable, and escalate to the store manager. <span className="block text-gray-500">સમસ્યા હોય તો અંદાજ ન લગાવો અને order board માં pickup code જાહેર ન કરો. જરૂરી નોંધ લખીને store manager ને જણાવો.</span></li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
