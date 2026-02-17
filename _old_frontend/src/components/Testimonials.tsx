import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Amara O.",
    text: "Sarafina Foods is my go-to for authentic African ingredients! The spices are so fresh and the delivery is always on time. Finally found a store that understands our cuisine!",
    rating: 5,
  },
  {
    name: "Michael K.",
    text: "The quality of the fresh meats is outstanding. Reminds me of home! The customer service is also excellent – they really care about their customers.",
    rating: 5,
  },
  {
    name: "Fatima B.",
    text: "I've been ordering from Sarafina Foods for months now. Their selection is amazing and everything is always fresh. Highly recommend to anyone missing the taste of home!",
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
