import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.email || "Failed to send reset link");
      }

      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/40 py-12 px-4">
        <div className="w-full max-w-md bg-background rounded-xl shadow-lg border p-8">
          <h1 className="text-2xl font-display font-bold text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email to receive a password reset link
          </p>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg text-primary text-sm">
                If an account exists for {email}, you will receive a password reset link shortly.
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full mt-4">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
