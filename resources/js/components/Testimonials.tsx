import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Tendai M. (UK)",
    text: "Living in London, it was always a hassle to send money or goods to my parents in Harare. Sarafina made it so easy! I ordered online and they received their groceries the next day.",
    rating: 5,
  },
  {
    name: "Sarah K. (USA)",
    text: "The quality of the fresh meat and produce is outstanding. My sister in Bulawayo was so impressed. It's such a relief to have a reliable service I can trust from Texas.",
    rating: 5,
  },
  {
    name: "Farai C. (Australia)",
    text: "I've been using Sarafina for months now to support my family back home. The website is easy to use, payments are secure, and the delivery team is very professional.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            What Our Customers Are Saying
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Sarafina Foods for their African food needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-2xl p-6 lg:p-8 shadow-medium relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
