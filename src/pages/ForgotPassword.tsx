import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import signAccessLogo from "@/assets/signaccess-logo.jpeg";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error(t("auth.invalidEmail"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `https://signaccess.cloud/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success(t("auth.resetEmailSent"));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <Card className="w-full max-w-md p-8 shadow-candy border-2">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">{t("app.name")}</h1>
          <img
            src={signAccessLogo}
            alt="SignaccesS Logo"
            className="w-48 h-auto mx-auto rounded-lg object-contain mb-4"
          />
          <p className="text-muted-foreground">{t("auth.forgotPasswordTitle")}</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t("auth.resetEmailSent")}</p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth">{t("auth.backToLogin")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
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

            <Button type="submit" className="w-full gradient-candy" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.pleaseWait")}
                </>
              ) : (
                t("auth.sendResetLink")
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
