import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const staticSlides = [
  {
    image_path: hero1,
    title: "Send Love Home to Zimbabwe",
    subtitle: "Connecting Families",
    description: "Shop online from anywhere in the world and have premium groceries delivered to your loved ones in Zimbabwe.",
    cta_text: "Start Shopping",
    link_url: "/shop"
  },
  {
    image_path: hero2,
    title: "Sarafina",
    subtitle: "Trusted Quality",
    description: "Your reliable partner for authentic groceries, fresh produce, and household essentials in Zimbabwe.",
    cta_text: "Explore Our Range",
    link_url: "/shop"
  },
  {
    image_path: hero3,
    title: "Fresh & Delivered",
    subtitle: "Doorstep Delivery",
    description: "We ensure your family receives only the freshest quality products, delivered with care and professionalism.",
    cta_text: "Order Now",
    link_url: "/shop"
  },
];

interface Slide {
    id?: number;
    image_path: string;
    title: string;
    subtitle: string;
    description: string;
    cta_text: string;
    link_url?: string;
}

export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(staticSlides);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/public/banners');
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setSlides(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const goTo = (index: number) => setCurrent(index);
  const goNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].image_path})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/80 via-brand-charcoal/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl"
          >
            {slides[current].subtitle && (
                <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full mb-4"
                >
                {slides[current].subtitle}
                </motion.span>
            )}
            {slides[current].title && (
                <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight"
                >
                {slides[current].title}
                </motion.h1>
            )}
            {slides[current].description && (
                <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg"
                >
                {slides[current].description}
                </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full" onClick={() => navigate(slides[current].link_url || '/shop')}>
                {slides[current].cta_text || 'Start Shopping'}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm hidden md:block"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-sm hidden md:block"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
};
