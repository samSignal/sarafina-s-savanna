import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

type DeptLink = { name: string; href: string };

export const ShopByDepartment = () => {
  const [departments, setDepartments] = useState<DeptLink[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        let depts: any[] = [];
        const res = await fetch("/api/public/departments");
        if (res.ok) {
          depts = (await res.json())?.filter((d: any) => (d.status || "").toLowerCase() === "active");
        }
        if (!depts || depts.length === 0) {
          const resFallback = await fetch("/api/departments");
          if (resFallback.ok) {
            const raw = await resFallback.json();
            depts = Array.isArray(raw) ? raw.filter((d: any) => (d.status || '').toLowerCase() === 'active') : [];
          }
        }
        const links: DeptLink[] = (depts || []).map((d: any) => ({
          name: d.name,
          href: `/category/${d.id}`,
        }));
        const limited = links.slice(0, 11);
        const extras: DeptLink[] = [
          { name: "Promotions", href: "/promotions" },
          { name: "Gift Cards", href: "/gift-cards" },
          { name: "Shop All", href: "/shop" },
        ];
        const viewAll: DeptLink[] = links.length > 11 ? [{ name: "View All Departments", href: "/departments" }] : [];
        setDepartments([...limited, ...extras, ...viewAll]);
      } catch (error) {
        setDepartments([
          { name: "Promotions", href: "/promotions" },
          { name: "Gift Cards", href: "/gift-cards" },
          { name: "Shop All", href: "/shop" },
        ]);
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
