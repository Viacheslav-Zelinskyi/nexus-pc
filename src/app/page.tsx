import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category_grid";
import { FeaturedProducts } from "@/components/home/featured_products";
import { BuilderBanner } from "@/components/home/builder_banner";
import { Deals } from "@/components/home/deals";

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
