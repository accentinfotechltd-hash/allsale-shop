import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ArrowRight, Sparkles } from "lucide-react";
import { BACKEND_URL } from "@/lib/utils";
import type { Product, Taxonomy } from "@/lib/api";

// SSR data fetch (revalidate every 5 min for ISR-like behaviour)
async function getHomeData() {
  const fetchOpts: RequestInit = { next: { revalidate: 300 } } as any;
  try {
    const [productsRes, taxonomyRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/products?limit=24`, fetchOpts),
      fetch(`${BACKEND_URL}/api/taxonomy`, fetchOpts),
    ]);
    const products: Product[] = productsRes.ok ? await productsRes.json() : [];
    const taxonomy: Taxonomy[] = taxonomyRes.ok ? await taxonomyRes.json() : [];
    return { products, taxonomy };
  } catch {
    return { products: [] as Product[], taxonomy: [] as Taxonomy[] };
  }
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80";
const CATEGORY_IMAGES: Record<string, string> = {
  "Ethnic Fashion":
    "https://images.unsplash.com/photo-1599746146388-a7ec2004b67a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Home & Puja":
    "https://images.unsplash.com/photo-1550583074-288b9c016df5?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Jewellery":
    "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Jewelry & Accessories":
    "https://images.unsplash.com/photo-1756483560049-e7b2208f99a0?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Beauty & Health":
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Home & Decor":
    "https://images.unsplash.com/photo-1620619767323-b95a89183081?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  "Books & Gifts":
    "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
};

const fallbackImg =
  "https://images.unsplash.com/photo-1671642883395-0ab89c3ac890?crop=entropy&cs=srgb&fm=jpg&w=800&q=80";

export default async function HomePage() {
  const { products, taxonomy } = await getHomeData();
  const featured = products.slice(0, 8);
  const trending = products.slice(8, 16);
  const bestsellers = products.slice(16, 24);

  return (
    <div data-testid="home-page" className="pb-8">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
        <div className="container-px py-12 md:py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-orange-200 text-xs font-bold text-orange-900 mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              India · Handpicked · Delivered worldwide
            </div>
            <h1 className="heading-xl text-slate-900">
              The Indian bazaar,<br />
              <span className="text-primary">on your doorstep.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-700 max-w-xl leading-relaxed">
              Sarees from Banaras, brassware from Moradabad, spices from Kerala, jewellery from Jaipur —
              shipped to New Zealand, Australia and beyond, with duties calculated upfront.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary text-base px-7 py-3" data-testid="hero-shop-now-cta">
                Shop the bazaar <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?sort=newest"
                className="btn-secondary text-base px-7 py-3"
                data-testid="hero-new-arrivals-cta"
              >
                What&apos;s new
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-slate-600 font-medium">
              <span>★ 4.8 · 12,000+ orders shipped</span>
              <span>· Tracked via Shiprocket X</span>
              <span>· Pay in your local currency</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white -rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="Bridal collection" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <div className="text-white text-xs tracking-[0.2em] uppercase font-bold opacity-90">Featured edit</div>
                <div className="text-white font-heading font-extrabold text-2xl">Bridal Collection</div>
              </div>
            </div>
            {/* floating mini card */}
            <div className="hidden md:block absolute -left-8 bottom-6 w-56 rounded-2xl bg-white shadow-xl p-4 rotate-3 border border-slate-200">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Live · trending</div>
              <div className="mt-1 font-heading font-extrabold text-lg leading-tight">
                Hand-block printed sarees
              </div>
              <div className="text-xs text-slate-500 mt-1">from $79 · ships in 7 days</div>
            </div>
          </div>
        </div>

        {/* decorative bottom edge */}
        <svg
          className="block w-full h-12 text-background"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path d="M0,80 L1440,80 L1440,30 Q720,90 0,30 Z" fill="currentColor" />
        </svg>
      </section>

      {/* MARQUEE TRUST STRIP */}
      <section className="bg-slate-900 text-white/90 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap py-4 text-xs font-bold tracking-[0.25em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 px-6">
              <span>★ 4.8 · trustpilot</span>
              <span>· Free shipping over $150</span>
              <span>· 14-day returns</span>
              <span>· 28 languages</span>
              <span>· Stripe-secure payments</span>
              <span>· Shiprocket tracked</span>
              <span>· Made in India · 🇮🇳</span>
              <span>· Pay in NZD AUD USD GBP CAD</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY BENTO */}
      {taxonomy.length > 0 && (
        <section className="container-px py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">Shop by craft</div>
              <h2 className="heading-lg">Explore the bazaar</h2>
            </div>
            <Link href="/products" className="hidden md:inline-flex btn-ghost text-sm">
              All categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6">
            {taxonomy.slice(0, 6).map((cat, idx) => {
              // bento layout: first card is large, others smaller
              const span =
                idx === 0
                  ? "md:col-span-3 lg:col-span-6 row-span-2 aspect-square md:aspect-[3/4] lg:aspect-[5/4]"
                  : "md:col-span-3 lg:col-span-3 aspect-square md:aspect-[5/4]";
              return (
                <Link
                  key={cat.key}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 ${span}`}
                  data-testid={`category-tile-${cat.key}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={CATEGORY_IMAGES[cat.name] || fallbackImg}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-white font-heading font-extrabold text-xl md:text-2xl leading-tight">
                      {cat.name}
                    </div>
                    <div className="text-white/80 text-xs mt-1 line-clamp-2 max-w-xs">
                      {cat.blurb}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-white text-xs font-bold opacity-90 group-hover:opacity-100">
                      Shop {cat.name.toLowerCase()} <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="container-px py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">This week&apos;s edit</div>
              <h2 className="heading-lg">Handpicked for you</h2>
            </div>
            <Link href="/products" className="btn-ghost text-sm hidden md:inline-flex">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* INDIA STORY */}
      <section className="my-16 md:my-24">
        <div className="container-px grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1620619767323-b95a89183081?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80"
              alt="Indian artisan"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="eyebrow mb-3">Our story</div>
            <h2 className="heading-lg mb-5">
              500+ Indian sellers,<br />one trusted bazaar.
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Allsale connects independent makers and family-run businesses across India with shoppers
              around the world. Every seller is KYC-verified. Every order is tracked door-to-door.
              Duties are calculated upfront so there are no surprises at customs.
            </p>
            <p className="text-slate-700 leading-relaxed mb-7">
              From Banarasi weavers to Jaipur jewellers, we&apos;re building the most trusted way to buy India.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">Start shopping</Link>
              <a
                href="https://allsale-shop.preview.emergentagent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Become a seller
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="container-px py-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">Trending now</div>
              <h2 className="heading-lg">What shoppers are loving</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="container-px py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-2">Bazaar bestsellers</div>
              <h2 className="heading-lg">Most loved this season</h2>
            </div>
            <Link href="/products" className="btn-ghost text-sm hidden md:inline-flex">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="container-px my-16">
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-rose-500 text-white px-6 md:px-14 py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px"
          }} />
          <div className="relative max-w-2xl">
            <div className="eyebrow !text-white/80 mb-3">Stay in the loop</div>
            <h3 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight">
              First dibs on Diwali, weddings and festive edits.
            </h3>
            <p className="mt-3 text-white/90 max-w-lg">
              One email a week. Exclusive coupons, new artisan stories, and shipping deals to NZ, AU, US, UK & CA.
            </p>
            <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md" data-testid="newsletter-form" action="#" method="post">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 rounded-full px-5 py-3 text-slate-900 bg-white focus:outline-none focus:ring-4 focus:ring-white/30"
                data-testid="newsletter-email"
              />
              <button type="submit" className="rounded-full px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold transition" data-testid="newsletter-submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
