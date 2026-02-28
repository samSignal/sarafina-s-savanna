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
              We Are <span className="text-primary">Sarafina</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              <strong>Sarafina</strong> is more than just a shop; we are a bridge connecting the 
              global diaspora with their roots in Zimbabwe. Whether you are in the UK, USA, 
              or anywhere else, we make it easy to care for your family back home.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              With our seamless online platform and established physical presence in Zimbabwe, 
              you can shop with confidence knowing that your loved ones will receive premium quality 
              groceries and essentials. We combine international service standards with local reliability.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Order Online from Anywhere in the World",
                "Reliable Local Delivery & Collection in Zimbabwe",
                "Secure International Payments",
                "Premium Quality Fresh Produce & Groceries",
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
