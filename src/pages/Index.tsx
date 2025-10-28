import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Languages, MessageSquare, Users, Video, Link as LinkIcon, GraduationCap, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and if onboarding is completed
    const checkOnboardingStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
        }
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const sections = [
    {
      id: "apprentissage",
      title: "Apprentissage",
      description: "Apprenez la LSFB par niveaux ou mode enfant avec des exercices ludiques",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "dictionnaire",
      title: "Dictionnaire",
      description: "Recherchez des mots et découvrez leur traduction en LSFB",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "quizz",
      title: "Quizz",
      description: "Testez vos connaissances avec des exercices interactifs",
      icon: List,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "traduction",
      title: "Traduction",
      description: "Traduisez des phrases complètes en langue des signes",
      icon: Languages,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "stereotype",
      title: "Stéréotype",
      description: "Découvrez et déconstruisez les stéréotypes sur la surdité",
      icon: Users,
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: "starterpack",
      title: "Starter Pack",
      description: "Commencez avec les bases essentielles de la LSFB",
      icon: Video,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "liens",
      title: "Liens Utiles",
      description: "Ressources et liens pour approfondir votre apprentissage",
      icon: LinkIcon,
      color: "from-teal-500 to-cyan-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Bienvenue sur LSFB Learn
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Votre plateforme d'apprentissage de la Langue des Signes Francophone Belge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card 
                key={section.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border-2 hover:border-primary/50"
                onClick={() => navigate(`/dashboard?section=${section.id}`)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{section.title}</CardTitle>
                  <CardDescription className="text-base">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Accéder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="text-lg px-8"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Voir toutes les sections
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
