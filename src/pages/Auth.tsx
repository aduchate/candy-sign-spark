import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import signAccessLogo from "@/assets/signaccess-logo.jpeg";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Si déjà connecté, on va directement au dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validated = authSchema.parse({ email, password });

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error(t('auth.invalidCredentials'));
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success(t('auth.welcomeBackMessage'));
        navigate("/dashboard");
      } else {
        const redirectUrl = `https://signaccess.cloud/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        // Detect "email already registered":
        //   - explicit error from Supabase, OR
        //   - anti-enumeration response: user returned but identities array is empty
        const alreadyRegistered =
          (error && /already registered|already exists|user already/i.test(error.message)) ||
          (!error && data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);

        if (alreadyRegistered) {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: validated.email,
            options: {
              emailRedirectTo: redirectUrl,
              shouldCreateUser: false,
            },
          });

          if (otpError) {
            toast.error(otpError.message);
            return;
          }

          toast.success(t('auth.magicLinkSent'));
          setIsLogin(true);
          return;
        }

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success(t('auth.accountCreated'));
        navigate("/onboarding");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <Card className="w-full max-w-md p-8 shadow-candy border-2">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">{t('app.name')}</h1>
          <img src={signAccessLogo} alt="SignaccesS Logo" className="w-48 h-auto mx-auto rounded-lg object-contain mb-4" />
          <p className="text-muted-foreground">
            {isLogin ? t('auth.welcomeBack') : t('auth.startJourney')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-candy"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.pleaseWait')}
              </>
            ) : (
              <>{isLogin ? t('auth.signIn') : t('auth.signUp')}</>
            )}
          </Button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('auth.forgotPassword')}
            </a>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
            <span className="text-primary font-semibold">
              {isLogin ? t('auth.signUp') : t('auth.signIn')}
            </span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
