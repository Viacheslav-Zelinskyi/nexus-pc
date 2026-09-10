import { BuilderBanner } from "@/components/home/builder_banner";
import { CategoryGrid } from "@/components/home/category_grid";
import { Deals } from "@/components/home/deals";
import { FeaturedProducts } from "@/components/home/featured_products";
import { Hero } from "@/components/home/hero";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <BuilderBanner />
      <Deals />
    </main>
  );
}
