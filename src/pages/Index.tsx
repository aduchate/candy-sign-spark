import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarding_completed) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-muted-foreground">Chargement...</span>
    </div>
  );
};

export default Index;
