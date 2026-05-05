import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

type Dept = { id: number; name: string };

export default function Departments() {
  const [departments, setDepartments] = useState<Dept[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        let depts: any[] = [];
        const res = await fetch("/api/public/departments");
        if (res.ok) {
          const data = await res.json();
          depts = Array.isArray(data) ? data.filter((d: any) => (d.status || "").toLowerCase() === "active") : [];
        }
        if (!depts || depts.length === 0) {
          const res2 = await fetch("/api/departments");
          if (res2.ok) {
            const data2 = await res2.json();
            depts = Array.isArray(data2) ? data2.filter((d: any) => (d.status || "").toLowerCase() === "active") : [];
          }
        }
        setDepartments((depts || []).map((d: any) => ({ id: d.id, name: d.name })));
      } catch {
        setDepartments([]);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Departments" 
        description="Browse all departments at Sarafina. Find the best African products, spices, and groceries for your family."
        keywords="African grocery departments, Sarafina shop, authentic African products"
      />
      <Header />
      <main className="flex-1">
        <div className="bg-muted py-12 md:py-16">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              All Departments
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse every department in our store.
            </p>
          </div>
        </div>
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {departments.map((d, idx) => (
              <motion.a
                key={d.id}
                href={`/category/${d.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ scale: 1.02 }}
                className="group flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-2 border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <span className="font-medium text-sm md:text-base">{d.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
