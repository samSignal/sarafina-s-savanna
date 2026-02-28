import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I order from outside Zimbabwe?",
    answer:
      "Yes! Our platform is specifically designed for the diaspora. You can order from anywhere in the world (UK, USA, Australia, etc.) and we will deliver the goods to your loved ones in Zimbabwe.",
  },
  {
    question: "Where do you deliver in Zimbabwe?",
    answer:
      "We currently deliver to Harare, Bulawayo, and surrounding areas. We also offer a 'Click & Collect' service at our physical stores for your family to pick up.",
  },
  {
    question: "How do I pay for my order?",
    answer:
      "We accept all major international credit/debit cards (Visa, Mastercard) and secure online payment methods. You pay in your local currency, and we handle the rest.",
  },
  {
    question: "How long will delivery take?",
    answer:
      "For orders in Harare and Bulawayo, we typically deliver within 24-48 hours. Fresh produce and meat orders are prepared on the day of delivery to ensure maximum freshness.",
  },
  {
    question: "Can I send a personalized message?",
    answer:
      "Absolutely! You can add a gift message at checkout, which we will include with the delivery to add that personal touch for your family.",
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
