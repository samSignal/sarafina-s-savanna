import { useParams, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const InfoPage = () => {
  const location = useLocation();
  const path = location.pathname.replace("/", "").replace("-", " ");
  
  const getTitle = () => {
    switch (location.pathname) {
      case "/contact":
        return "Contact Us";
      case "/faq":
        return "Frequently Asked Questions";
      case "/shipping-policy":
        return "Shipping & Delivery";
      case "/returns-policy":
        return "Returns Policy";
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
          <div className="space-y-4">
            <p>We'd love to hear from you. Please reach out to us at:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email: support@sarafinamarket.com</li>
              <li>Phone: +263 77 123 4567</li>
              <li>Address: Harare, Zimbabwe</li>
            </ul>
          </div>
        );
      case "/faq":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">Do you deliver internationally?</h3>
              <p>No, we currently deliver within Zimbabwe, but you can order from anywhere in the world.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">How long does delivery take?</h3>
              <p>Delivery typically takes 1-3 business days depending on your location.</p>
            </div>
          </div>
        );
      default:
        return (
          <p>
            This is the {getTitle()} page. The content for this section is currently being updated.
            Please check back soon.
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-8">
          {getTitle()}
        </h1>
        <div className="prose max-w-none text-muted-foreground">
          {getContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
