import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    title: "Send Love Home to Zimbabwe",
    subtitle: "Connecting Families",
    description: "Shop online from anywhere in the world and have premium groceries delivered to your loved ones in Zimbabwe.",
    cta: "Start Shopping",
  },
  {
    image: hero2,
    title: "Sarafina's Savanna",
    subtitle: "Trusted Quality",
    description: "Your reliable partner for authentic groceries, fresh produce, and household essentials in Zimbabwe.",
    cta: "Explore Our Range",
  },
  {
    image: hero3,
    title: "Fresh & Delivered",
    subtitle: "Doorstep Delivery",
    description: "We ensure your family receives only the freshest quality products, delivered with care and professionalism.",
    cta: "Order Now",
  },
];

export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
            style={{ backgroundImage: `url(${slides[current].image})` }}
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
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-block px-4 py-2 bg-secondary text-secondary-foreground text-sm font-semibold rounded-full mb-4"
            >
              {slides[current].subtitle}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-4 leading-tight"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-lg"
            >
              {slides[current].description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" variant="hero" className="text-lg px-8 py-6">
                {slides[current].cta}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm hover:bg-background/40 rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-primary-foreground" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/20 backdrop-blur-sm hover:bg-background/40 rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-primary-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-secondary w-8"
                : "bg-primary-foreground/50 hover:bg-primary-foreground/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
