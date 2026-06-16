import Link from "next/link";
import { Instagram, Mail, Shield, Truck, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-slate-900 text-slate-300" data-testid="site-footer">
      {/* trust strip */}
      <div className="border-b border-white/5">
        <div className="container-px py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Secure payments", desc: "Stripe-powered checkout · 256-bit encryption" },
            { icon: Truck, title: "Tracked global shipping", desc: "Shiprocket X · 7–14 days door-to-door" },
            { icon: Globe, title: "Multi-currency", desc: "NZD · AUD · USD · GBP · CAD auto-detected" },
            { icon: Mail, title: "Real human support", desc: "hello@allsale.co.nz · reply within 24h" },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-primary">
                <b.icon className="w-5 h-5" />
              </span>
              <div>
                <div className="font-bold text-white text-sm">{b.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-px py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-black">
              अ
            </span>
            <span className="font-heading text-2xl font-extrabold text-white">
              allsale<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="text-sm max-w-md leading-relaxed">
            Allsale is a cross-border bazaar bringing handpicked Indian craftsmanship — sarees, jewellery,
            spices, brassware and more — to homes in New Zealand, Australia, the US, the UK and Canada.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://instagram.com/allsale.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              data-testid="footer-instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow !text-white/60 mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            <li><Link href="/products?category=Ethnic+Fashion" className="hover:text-white">Ethnic fashion</Link></li>
            <li><Link href="/products?category=Jewellery" className="hover:text-white">Jewellery</Link></li>
            <li><Link href="/products?category=Home+%26+Decor" className="hover:text-white">Home & Decor</Link></li>
            <li><Link href="/products?sort=newest" className="hover:text-white">New arrivals</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow !text-white/60 mb-4">Help</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-white">My account</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">Orders & tracking</Link></li>
            <li><a href="mailto:hello@allsale.co.nz" className="hover:text-white">Contact us</a></li>
            <li><Link href="/legal/shipping" className="hover:text-white">Shipping & duties</Link></li>
            <li><Link href="/legal/returns" className="hover:text-white">Returns</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-px py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Allsale Ltd · Auckland, New Zealand</span>
          <span>Made with care in Aotearoa & India</span>
        </div>
      </div>
    </footer>
  );
}
