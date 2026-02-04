import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsSection } from "@/components/NewsSection";
import { JobListingsSection } from "@/components/JobListingsSection";
import { CategoryArticleSection } from "@/components/CategoryArticleSection";
import { Newspaper, Briefcase, FileText, Rocket, GraduationCap, Calendar } from "lucide-react";

type UtilitaireTab = "actualites" | "emploi" | "administration" | "projets" | "formations" | "evenements";

export const UtilitairesSection = () => {
  const [activeTab, setActiveTab] = useState<UtilitaireTab>("actualites");

  return (
    <div className="max-w-6xl">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UtilitaireTab)}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6 h-auto gap-2 bg-transparent">
          <TabsTrigger 
            value="actualites" 
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-xs">Actualités</span>
          </TabsTrigger>
          <TabsTrigger 
            value="emploi"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">Aide à l'Emploi</span>
          </TabsTrigger>
          <TabsTrigger 
            value="administration"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Administration</span>
          </TabsTrigger>
          <TabsTrigger 
            value="projets"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Rocket className="w-5 h-5" />
            <span className="text-xs">Projets</span>
          </TabsTrigger>
          <TabsTrigger 
            value="formations"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs">Formations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="evenements"
            className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Événements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actualites">
          <NewsSection />
        </TabsContent>

        <TabsContent value="emploi">
          <JobListingsSection />
        </TabsContent>

        <TabsContent value="administration">
          <CategoryArticleSection 
            category="Atelier" 
            icon="📋"
            description="Informations et démarches administratives"
          />
        </TabsContent>

        <TabsContent value="projets">
          <CategoryArticleSection 
            category="Projets" 
            icon="🚀"
            description="Projets en cours et à venir"
          />
        </TabsContent>

        <TabsContent value="formations">
          <CategoryArticleSection 
            category="Formations accessibles" 
            icon="🎓"
            description="Formations accessibles aux personnes sourdes et malentendantes"
          />
        </TabsContent>

        <TabsContent value="evenements">
          <CategoryArticleSection 
            category="Événements" 
            icon="📅"
            description="Événements et rencontres du SAREW"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
