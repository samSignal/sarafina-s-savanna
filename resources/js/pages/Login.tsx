import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      toast.success("Signed in successfully");
      const redirect = searchParams.get("redirect");
      
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate("/admin");
      } else {
        navigate(redirect || "/");
      }
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/40">
        <div className="w-full max-w-md bg-background rounded-xl shadow-lg border p-8 mx-4">
          <h1 className="text-2xl font-display font-bold text-center mb-2">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Welcome back to Sarafina
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            New here?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
