import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long will my delivery take?",
    answer:
      "Once your order is placed, we require 1-2 working days for processing and 2 additional working days for delivery. Fresh meat orders may take an extra day as they are prepared fresh before shipping.",
  },
  {
    question: "Do you offer free delivery?",
    answer:
      "Yes! We offer free delivery on all orders over £50. For orders under £50, a flat rate delivery fee of £4.99 applies.",
  },
  {
    question: "How do I know my products are fresh?",
    answer:
      "All our products are carefully sourced and stored in optimal conditions. Fresh items are packed with ice packs and delivered in insulated packaging to ensure freshness.",
  },
  {
    question: "What areas do you deliver to?",
    answer:
      "We currently deliver to all UK mainland addresses. Unfortunately, we do not ship to Northern Ireland, the Channel Islands, or the Isle of Man at this time.",
  },
  {
    question: "Can I return or exchange products?",
    answer:
      "Due to the perishable nature of our products, we cannot accept returns. However, if you receive damaged or incorrect items, please contact us within 24 hours and we'll resolve the issue.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-muted rounded-lg px-6 border-0"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
