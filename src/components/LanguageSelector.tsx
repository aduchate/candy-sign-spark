import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2" 
      onClick={toggleLanguage}
    >
      <Languages className="w-4 h-4" />
      {i18n.language === 'en' ? 'FR' : 'EN'}
    </Button>
  );
};

export default LanguageSelector;
