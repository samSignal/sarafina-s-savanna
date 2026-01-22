import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import catMeat from "@/assets/cat-meat.jpg";
import catSpices from "@/assets/cat-spices.jpg";
import catProduce from "@/assets/cat-produce.jpg";
import catDrinks from "@/assets/cat-drinks.jpg";

const categories = [
  {
    title: "Fresh Meats",
    description: "Premium cuts and traditional favorites",
    image: catMeat,
    href: "#",
  },
  {
    title: "Spices & Seasonings",
    description: "Authentic African flavors",
    image: catSpices,
    href: "#",
  },
  {
    title: "Fresh Produce",
    description: "Tropical fruits & vegetables",
    image: catProduce,
    href: "#",
  },
  {
    title: "Beverages",
    description: "Traditional drinks & refreshments",
    image: catDrinks,
    href: "#",
  },
];

export const FeaturedCategories = () => {
  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-2xl md:text-3xl font-bold text-primary mb-4"
        >
          EVERYDAY SHOPPING
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Discover our wide selection of authentic African foods and ingredients
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.a
              key={category.title}
              href={category.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-card shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
