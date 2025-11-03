-- Rename description column to signed_grammar and add phrase column to word_signs
ALTER TABLE word_signs 
RENAME COLUMN description TO signed_grammar;

ALTER TABLE word_signs 
ADD COLUMN phrase text;

COMMENT ON COLUMN word_signs.signed_grammar IS 'Grammaire signée du mot (ex: TOI - NOM - QUOI ?)';
COMMENT ON COLUMN word_signs.phrase IS 'Phrase de base utilisant ce mot (ex: comment tu t''appelles ?)';