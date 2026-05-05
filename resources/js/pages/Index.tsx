import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { ShopByDepartment } from "@/components/ShopByDepartment";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { AboutSection } from "@/components/AboutSection";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  const siteUrl = window.location.origin;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "name": "Sarafina",
    "url": siteUrl,
    "description": "Authentic African groceries and flavours delivered within Zimbabwe.",
    "logo": `${siteUrl}/images/department logo/sarafina logo.jpeg`,
    "image": `${siteUrl}/images/og-image.jpg`,
    "priceRange": "££",
    "currenciesAccepted": "GBP, USD",
    "paymentAccepted": "Credit Card, Debit Card",
    "areaServed": "Zimbabwe",
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home" 
        description="Shop authentic African groceries, spices, and pantry essentials at Sarafina. We deliver fresh produce and quality products to your loved ones in Zimbabwe."
        keywords="African groceries, African spices, Zimbabwe grocery delivery, Sarafina, authentic African food, diaspora grocery"
        structuredData={structuredData}
      />
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
