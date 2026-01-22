import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { ShopByDepartment } from "@/components/ShopByDepartment";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { AboutSection } from "@/components/AboutSection";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSlider />
        <ShopByDepartment />
        <FeaturedCategories />
        <AboutSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
