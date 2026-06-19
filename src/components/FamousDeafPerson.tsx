import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Phrases décrivant Emmanuelle Laborit. Chaque mot entre {} sera, si possible,
// remplacé par une vignette vidéo provenant du dictionnaire LSFB (table word_signs).
const TRANSLATION_BLOCKS: { label: string; sentence: string }[] = [
  {
    label: "Qui ?",
    sentence:
      "{Emmanuelle} {Laborit} {sourde} {naissance}. {actrice}, {directrice} {IVT}, {ambassadrice} {LSF}, {autrice}.",
  },
  {
    label: "Quoi ?",
    sentence: "{prix} {molière} {1993}. {première} {comédienne} {sourde} {France}.",
  },
  {
    label: "Quand ?",
    sentence:
      "{née} {18} {octobre} {1971}. {1978} {père} {apprendre} {LSF}. {1993} {gagner} {molière}. {2003} {directrice} {IVT}. {2012} {officière} {ordre} {arts}.",
  },
  { label: "Où ?", sentence: "{née} {Paris} {France}. {nationalité} {française}." },
  {
    label: "Pourquoi connue ?",
    sentence: "{27} {ans} {carrière}. {11} {films}. {beaucoup} {spectateurs}.",
  },
];

const BIO_FIELDS: { label: string; lines: string[] }[] = [
  {
    label: "Qui ?",
    lines: [
      "Emmanuelle Laborit",
      "Sourde de naissance",
      "Actrice, directrice de l'IVT, ambassadrice de la LSF, autrice",
      "A travaillé avec : Chantal Liennel, Laura Betti, Philippe Noiret",
    ],
  },
  {
    label: "Quoi fait de spécial ?",
    lines: [
      "Prix Molière 1993",
      "1ʳᵉ comédienne sourde de France",
    ],
  },
  {
    label: "Quand ?",
    lines: [
      "Née le 18 octobre 1971 (54 ans)",
      "1978 : à 7 ans, son père lui apprend la LSF",
      "1993 : gagne le Molière",
      "2003 : devient directrice de l'IVT",
      "2012 : Officière dans l'Ordre des Arts",
    ],
  },
  {
    label: "Où ?",
    lines: ["Née à Paris, France", "Nationalité française"],
  },
  {
    label: "Pourquoi connue ?",
    lines: ["27 ans de carrière", "11 films", "398 000 entrées en salle"],
  },
];

const normalize = (s: string) =>
  s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const FamousDeafPerson = () => {
  const [signsByWord, setSignsByWord] = useState<Record<string, string>>({});

  const tokens = useMemo(() => {
    const set = new Set<string>();
    for (const b of TRANSLATION_BLOCKS) {
      const matches = b.sentence.match(/\{([^}]+)\}/g) || [];
      for (const m of matches) set.add(normalize(m.slice(1, -1)));
    }
    return Array.from(set);
  }, []);

  useEffect(() => {
    if (tokens.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("word_signs")
        .select("word, video_url");
      const map: Record<string, string> = {};
      for (const row of (data || []) as { word: string; video_url: string }[]) {
        if (!row.video_url) continue;
        const key = normalize(row.word);
        if (tokens.includes(key) && !map[key]) map[key] = row.video_url;
      }
      setSignsByWord(map);
    })();
  }, [tokens]);

  const renderSentence = (sentence: string) => {
    const parts = sentence.split(/(\{[^}]+\})/g);
    return parts.map((part, i) => {
      const m = part.match(/^\{([^}]+)\}$/);
      if (!m) return <span key={i}>{part}</span>;
      const original = m[1];
      const key = normalize(original);
      const url = signsByWord[key];
      if (url) {
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 align-middle bg-primary/5 border border-primary/20 rounded px-1.5 py-0.5 mx-0.5 my-0.5"
          >
            <video
              src={url}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-10 w-14 object-cover rounded cursor-pointer bg-muted"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <span className="text-sm font-medium">{original}</span>
          </span>
        );
      }
      return (
        <span
          key={i}
          className="inline-block bg-muted text-muted-foreground rounded px-1.5 py-0.5 mx-0.5 text-sm"
          title="Signe non disponible dans le dictionnaire"
        >
          {original}
        </span>
      );
    });
  };

  const matchedCount = Object.keys(signsByWord).length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold">Sourde célèbre : Emmanuelle Laborit</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Présentation à gauche, traduction signée à droite. Survolez une vignette
        pour voir le signe en LSFB.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Fiche de présentation</h4>
          {BIO_FIELDS.map((field) => (
            <div key={field.label} className="border-l-2 border-primary/30 pl-3">
              <p className="font-semibold text-sm text-primary">{field.label}</p>
              <ul className="text-sm text-muted-foreground space-y-0.5 mt-1">
                {field.lines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            Traduction en signes
            <span className="text-xs font-normal text-muted-foreground">
              ({matchedCount} signe{matchedCount > 1 ? "s" : ""} disponible
              {matchedCount > 1 ? "s" : ""})
            </span>
          </h4>
          {TRANSLATION_BLOCKS.map((block) => (
            <div key={block.label} className="border-l-2 border-primary/30 pl-3">
              <p className="font-semibold text-sm text-primary mb-1">
                {block.label}
              </p>
              <p className="leading-loose">{renderSentence(block.sentence)}</p>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-2">
            Les vignettes proviennent du dictionnaire LSFB. Les mots sans
            vignette n'ont pas (encore) de signe associé dans le dictionnaire.
          </p>
        </div>
      </div>
    </Card>
  );
};
