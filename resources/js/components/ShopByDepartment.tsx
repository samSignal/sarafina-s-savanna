import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

// Fallback data in case API fails or loads
const fallbackDepartments = [
  { name: "Fresh Meat", href: "#" },
  { name: "Spices", href: "#" },
  { name: "Drinks", href: "#" },
  { name: "Pantry", href: "#" },
  { name: "Snacks & Chips", href: "#" },
  { name: "Fresh Produce", href: "#" },
  { name: "Clearance", href: "#" },
  { name: "Shop All", href: "#" },
];

export const ShopByDepartment = () => {
  const [departments, setDepartments] = useState(fallbackDepartments);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/public/departments");
        if (response.ok) {
          const data = await response.json();
          // Filter only active departments and map to component format
          const activeDepts = data
            .filter((d: any) => d.status === "Active")
            .map((d: any) => ({
              name: d.name,
              href: `/category/${d.id}` // Assuming a category page exists or using ID
            }));
          
          // Always replace the fallback data when API succeeds
          const base = activeDepts;
          setDepartments([
            ...base,
            { name: "Shop All", href: "/shop" },
          ]);
        }
      } catch (error) {
        console.error("Failed to load departments", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-2xl md:text-3xl font-bold text-primary mb-8"
        >
          SHOP BY DEPARTMENT
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {departments.map((dept, index) => (
            <motion.a
              key={dept.name}
              href={dept.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-2 border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <span className="font-medium text-sm md:text-base">{dept.name}</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
