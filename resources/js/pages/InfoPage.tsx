import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, CreditCard, Truck, ShieldCheck, HelpCircle } from "lucide-react";

const InfoPage = () => {
  const location = useLocation();
  const path = location.pathname.replace("/", "").replace("-", " ");
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/general/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings for info page", error);
      }
    };
    fetchSettings();
  }, []);
  
  const getTitle = () => {
    switch (location.pathname) {
      case "/contact":
        return "Contact Us";
      case "/faq":
        return "Frequently Asked Questions";
      case "/delivery-policy":
        return "Delivery Policy";
      case "/returns-policy":
        return "Returns & Refunds Policy";
      case "/terms":
        return "Terms & Conditions";
      case "/privacy":
        return "Privacy Policy";
      default:
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  const getContent = () => {
    switch (location.pathname) {
      case "/contact":
        return (
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <p className="text-lg leading-relaxed">
                We are here to help! Whether you have a question about your order, need assistance with our website, 
                or want to know more about our services, please don't hesitate to contact us.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                    <p className="text-sm mb-1">For general inquiries and support:</p>
                    <a href={`mailto:${settings?.support_email}`} className="text-primary hover:underline font-medium">
                      {settings?.support_email || "hello@sarafina.africa"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
                    <p className="text-sm mb-1">UK & International Support:</p>
                    <a href={`tel:${settings?.support_phone_uk?.replace(/\s+/g, '')}`} className="text-primary hover:underline font-medium block">
                      {settings?.support_phone_uk || "+44 123 456 7890"}
                    </a>
                    <p className="text-sm mt-2 mb-1">Zimbabwe Operations:</p>
                    <a href={`tel:${settings?.support_phone_zim?.replace(/\s+/g, '')}`} className="text-primary hover:underline font-medium block">
                      {settings?.support_phone_zim || "+263 77 123 4567"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Our Offices</h3>
                    <p className="mb-2 whitespace-pre-line">
                      <strong className="text-foreground">London HQ:</strong><br />
                      {settings?.address_uk || "123 African Market Street, London, UK"}
                    </p>
                    <p className="whitespace-pre-line">
                      <strong className="text-foreground">Harare Distribution Center:</strong><br />
                      {settings?.address_zim || "Unit 5, Msasa Industrial Park, Harare, Zimbabwe"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Operating Hours</h3>
                    <p>Monday - Friday: 08:00 - 18:00 (GMT)</p>
                    <p>Saturday: 09:00 - 14:00</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-8 rounded-2xl">
              <h3 className="font-display text-2xl font-bold text-primary mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input className="w-full px-3 py-2 border rounded-md bg-background" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input className="w-full px-3 py-2 border rounded-md bg-background" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input className="w-full px-3 py-2 border rounded-md bg-background" placeholder="john@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-background">
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Delivery Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea className="w-full px-3 py-2 border rounded-md bg-background min-h-[120px]" placeholder="How can we help you?" />
                </div>
                <button className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-md hover:bg-primary/90 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        );

      case "/faq":
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-lg text-center mb-8">
              Find answers to common questions about ordering, delivery, and our services.
            </p>

            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-card">
                <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Delivery & Locations
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Where do you deliver?</h4>
                    <p>We deliver throughout Harare and Bulawayo. For other cities and rural areas in Zimbabwe, please contact us before ordering to confirm availability and delivery rates.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Do you deliver internationally?</h4>
                    <p>No, we do not ship goods internationally. Our service is designed for customers worldwide (UK, USA, Australia, etc.) to buy groceries for delivery <strong>within Zimbabwe</strong>.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Can I choose a specific delivery date?</h4>
                    <p>Yes, during checkout you can select your preferred delivery date. We will do our best to accommodate your request.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-card">
                <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Ordering & Payment
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">What currencies do you accept?</h4>
                    <p>We accept payments in GBP (£), USD ($), and other major currencies via our secure online payment gateway. Prices on the site are displayed in GBP by default.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Is it safe to order online?</h4>
                    <p>Absolutely. We use industry-standard encryption and secure payment processors (like Stripe/PayPal) to ensure your financial information is never compromised.</p>
                  </div>
                   <div>
                    <h4 className="font-semibold mb-1">Can I change my order after placing it?</h4>
                    <p>If you need to make changes, please contact us immediately. If the order has not yet been processed or dispatched, we will do our best to assist you.</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-6 bg-card">
                <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Quality & Service
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">How fresh are the products?</h4>
                    <p>We source our fresh produce and meat daily from trusted local farmers and suppliers in Zimbabwe to ensure the highest quality for your loved ones.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Can I include a personal message?</h4>
                    <p>Yes! You can add a gift message at checkout, and we will include a handwritten note with the delivery.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">What happens if an item is out of stock?</h4>
                    <p>We try our best to keep stock levels accurate. If an item becomes unavailable, we will contact you to offer a suitable substitute or a refund for that item.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "/delivery-policy":
        return (
          <div className="space-y-8 max-w-4xl">
            <div className="bg-secondary/10 border-l-4 border-secondary p-4 mb-6">
              <p className="font-medium">
                <strong>Note:</strong> We provide local delivery within Zimbabwe. We do not ship products internationally.
              </p>
            </div>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Delivery Areas</h3>
              <p className="mb-4">
                Sarafina Market currently operates a dedicated delivery fleet in the following regions:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Harare Metropolitan Province:</strong> Including Chitungwiza, Epworth, and Ruwa.</li>
                <li><strong>Bulawayo Metropolitan Province:</strong> Including all suburbs.</li>
                <li><strong>Surrounding Areas:</strong> Deliveries to Norton, Marondera, and Chegutu may be arranged on specific days.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Delivery Times</h3>
              <p className="mb-4">
                We strive to deliver all orders as quickly as possible to ensure freshness.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-bold text-primary mb-2">Standard Delivery</h4>
                  <p>Orders placed before 12:00 PM (CAT) are typically delivered the <strong>next business day</strong>.</p>
                  <p>Orders placed after 12:00 PM will be delivered within 2 business days.</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-bold text-primary mb-2">Same-Day Delivery</h4>
                  <p>Available for select areas in Harare for orders placed before 10:00 AM (Subject to availability).</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Delivery Fees</h3>
              <p className="mb-4">
                Delivery fees are calculated at checkout based on the delivery address in Zimbabwe.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Orders over £100 equivalent qualify for <strong>FREE Delivery</strong>.</li>
                <li>Standard Harare Delivery: Flat rate of £5.00.</li>
                <li>Standard Bulawayo Delivery: Flat rate of £7.00.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Order Tracking & Receipt</h3>
              <p className="mb-2">
                Once your order is out for delivery, we will notify the recipient via SMS/Phone and you (the sender) via email.
              </p>
              <p>
                The recipient must be present to sign for the goods. If no one is home, we will attempt to contact them to make alternative arrangements. Re-delivery attempts may incur an additional fee.
              </p>
            </section>
          </div>
        );

      case "/returns-policy":
        return (
          <div className="space-y-8 max-w-4xl">
            <p className="text-lg">
              At Sarafina Market, we are committed to delivering high-quality products. If you or your recipient are not entirely satisfied with your purchase, we're here to help.
            </p>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Perishable Goods</h3>
              <p className="mb-4 text-muted-foreground">
                (Fresh Produce, Meat, Dairy, Bread, etc.)
              </p>
              <p className="mb-4">
                Due to the nature of perishable items, we cannot accept returns once the delivery has been accepted, unless the items are damaged, spoiled, or incorrect at the time of delivery.
              </p>
              <p className="bg-muted p-4 rounded-md">
                <strong>Important:</strong> Please instruct your recipient to inspect all fresh goods upon delivery. If there are any issues, they should reject the specific item immediately with the driver or contact us within 2 hours of delivery with photos of the product.
              </p>
            </section>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Non-Perishable Goods</h3>
              <p className="mb-4 text-muted-foreground">
                (Canned goods, Toiletries, Dry packets, etc.)
              </p>
              <p className="mb-4">
                You have 7 calendar days to return an item from the date of delivery. To be eligible for a return, the item must be:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Unused and in the same condition that it was received.</li>
                <li>In the original packaging.</li>
                <li>Accompanied by the receipt or proof of purchase.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-display text-xl font-bold mb-4">Refunds</h3>
              <p className="mb-4">
                Once we receive your item, we will inspect it and notify you of the status of your refund. If your return is approved, we will initiate a refund to your original method of payment (credit card, etc.).
              </p>
              <p>
                You will receive the credit within a certain amount of days, depending on your card issuer's policies.
              </p>
            </section>
          </div>
        );

      case "/terms":
        return (
          <div className="space-y-6 max-w-4xl text-sm md:text-base">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h3 className="font-bold text-lg mb-2">1. Introduction</h3>
              <p>Welcome to Sarafina Market. These Terms and Conditions govern your use of our website and the purchase of products from our online store. By accessing or using our service, you agree to be bound by these terms.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. Services</h3>
              <p>Sarafina Market provides an online platform for customers (primarily in the diaspora) to purchase groceries and household goods for delivery to recipients in Zimbabwe.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. Pricing and Payment</h3>
              <p>All prices are shown in GBP (£) unless otherwise stated. We reserve the right to change prices at any time without notice. Payment must be made in full at the time of ordering. We accept major credit/debit cards and other payment methods as displayed at checkout.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Product Availability</h3>
              <p>All products are subject to availability. In the event that an ordered item is out of stock, we will attempt to contact you to offer a suitable substitute or a refund for that item.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Delivery</h3>
              <p>Delivery will be made to the address specified in the order. We are not responsible for failure to deliver if the address provided is incorrect or incomplete. Please refer to our Delivery Policy for full details.</p>
            </section>

             <section>
              <h3 className="font-bold text-lg mb-2">6. Cancellations</h3>
              <p>Orders may be cancelled within 1 hour of placement. After this time, we may have already begun processing the order. Cancellations of perishable goods cannot be accepted once the order has been dispatched.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, Sarafina Market shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our service.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">8. Governing Law</h3>
              <p>These terms shall be governed by and construed in accordance with the laws of Zimbabwe and the United Kingdom, where applicable.</p>
            </section>
          </div>
        );

      case "/privacy":
        return (
          <div className="space-y-6 max-w-4xl">
             <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
             
             <section>
              <h3 className="font-bold text-lg mb-2">1. Information We Collect</h3>
              <p className="mb-2">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, and phone number.</li>
                <li>Recipient's name, address, and phone number in Zimbabwe.</li>
                <li>Payment information (processed securely by third-party providers).</li>
                <li>Order history and preferences.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. How We Use Your Information</h3>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process and fulfill your orders.</li>
                <li>Communicate with you about your order status.</li>
                <li>Send you newsletters and promotional offers (if you opted in).</li>
                <li>Improve our website and customer service.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. Information Sharing</h3>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service providers (e.g., payment processors, delivery drivers).</li>
                <li>Legal authorities if required by law.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Data Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Cookies</h3>
              <p>We use cookies to improve your browsing experience and personalize content. You can choose to disable cookies through your browser settings, though this may affect site functionality.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@sarafina.africa" className="text-primary hover:underline">privacy@sarafina.africa</a>.</p>
            </section>
          </div>
        );

      default:
        return (
          <p>
            This is the {getTitle()} page. The content for this section is currently being updated.
          </p>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold mb-4">{getTitle()}</h1>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          
          <div className="bg-background">
            {getContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
