import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import signAccessLogo from "@/assets/signaccess-logo.jpeg";

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Supabase puts recovery tokens in the URL hash after redirect
    const hash = window.location.hash;
    const type = new URLSearchParams(hash.replace("#", "?")).get("type");

    if (type === "recovery") {
      setValid(true);
    }
    setValidating(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error(t("auth.passwordTooShort"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordsMismatch"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("auth.passwordUpdated"));
      navigate("/auth");
    }

    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
        <Card className="w-full max-w-md p-8 shadow-candy border-2 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("auth.invalidLink")}</h1>
          <p className="text-muted-foreground mb-6">{t("auth.invalidLinkMessage")}</p>
          <Button asChild>
            <a href="/auth">{t("auth.backToLogin")}</a>
          </Button>
        </Card>
      </div>
    );
  }

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
          <p className="text-muted-foreground">{t("auth.resetPasswordTitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.newPassword")}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full gradient-candy" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.pleaseWait")}
              </>
            ) : (
              t("auth.updatePassword")
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
