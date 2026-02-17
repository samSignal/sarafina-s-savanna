import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import placeholderImg from "@/assets/cat-pantry.jpg"; // Fallback image

export const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          const activeDepts = data
            .filter((d: any) => d.status === 'Active')
            .map((d: any) => ({
              title: d.name,
              description: d.description || "Discover our selection",
              image: d.image || placeholderImg,
              href: `/category/${d.id}`,
            }));
          setCategories(activeDepts);
        }
      } catch (error) {
        console.error("Failed to load departments", error);
      }
    };

    fetchDepartments();
  }, []);

  if (categories.length === 0) return null;

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
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
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
