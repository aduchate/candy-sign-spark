import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DonationSection } from "@/components/DonationSection";

const Donations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Un don pour ASBL
          </h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 gradient-text">
              Soutenez les ASBL qui œuvrent pour la communauté sourde
            </h2>
            <p className="text-lg text-muted-foreground">
              Votre générosité permet aux associations de continuer leur mission d'inclusion 
              et d'accompagnement des personnes sourdes et malentendantes.
            </p>
          </div>
        </Card>

        <div className="space-y-8">
          <DonationSection 
            organization="SAREW"
            icon="❤️"
            description="Soutenez SAREW dans sa mission d'inclusion et d'accessibilité pour les personnes sourdes"
          />
        </div>
      </main>
    </div>
  );
};

export default Donations;
