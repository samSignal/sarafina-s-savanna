import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import aboutStore from "@/assets/about-store.jpg";

export const AboutSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-strong">
              <img
                src={aboutStore}
                alt="Sarafina Foods Store"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-medium hidden md:block">
              <p className="font-display text-3xl font-bold">10+</p>
              <p className="text-sm font-medium">Years of Excellence</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              About Us
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              We Are <span className="text-primary">Sarafina Foods</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              We bring the <strong>authentic taste of Africa</strong> to your doorstep.
              At Sarafina Foods, we pride ourselves in stocking all of your favourite
              African goods – from traditional spices to fresh produce.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Every item in our store tells a story of home, tradition, and flavour.
              Our carefully curated selection includes premium meats, authentic spices,
              fresh tropical fruits, and traditional beverages that will transport
              you straight to the heart of Africa.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "100% Authentic African Products",
                "Fresh Quality Guaranteed",
                "Fast & Reliable Delivery",
                "Family Recipes & Traditional Flavors",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <span className="w-2 h-2 bg-secondary rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="px-8">
              Learn More About Us
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
