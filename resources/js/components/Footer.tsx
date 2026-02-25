import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-brand-charcoal text-primary-foreground">
      {/* Newsletter */}
      <div className="bg-primary py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">
                Join Our Newsletter
              </h3>
              <p className="text-primary-foreground/80">
                Get exclusive offers and updates delivered to your inbox
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground text-foreground border-0 min-w-[250px]"
              />
              <Button variant="secondary" className="px-6 whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <a href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-accent-gradient flex items-center justify-center shadow-medium">
                  <img
                    src="/images/department%20logo/sarafina%20logo.jpeg"
                    alt="Sarafina Market logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-display text-3xl md:text-4xl font-bold">
                  Sarafina<span className="text-secondary">Market</span>
                </span>
              </a>
              <p className="text-primary-foreground/70 mb-6 leading-relaxed">
                Confident African flavours for every day. Bold, fresh and proudly Sarafina.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/share/g/1aVTavof8R/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/sarafinafoods?igsh=MWwxanpvZDU3MGZ6cA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@sarafinafoods?_r=1&_t=ZN-94CSVlThI1u" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-foreground/10 hover:bg-secondary rounded-full flex items-center justify-center transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {["Shop All", "Fresh Meat", "Spices", "Drinks", "Fresh Produce", "Clearance"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-6">Customer Service</h4>
              <ul className="space-y-3">
                {["Contact Us", "FAQs", "Shipping & Delivery", "Returns Policy", "Terms & Conditions", "Privacy Policy"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-primary-foreground/70">
                    123 African Market Street<br />
                    London, UK
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                  <a href="tel:+441234567890" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                    +44 123 456 7890
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                  <a href="mailto:hello@sarafina.africa" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                    hello@sarafina.africa
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10 py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2026 Sarafina. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" alt="Visa" className="h-8 opacity-60" />
            <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" className="h-8 opacity-60" />
            <img src="https://cdn-icons-png.flaticon.com/512/349/349230.png" alt="PayPal" className="h-8 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  );
};
