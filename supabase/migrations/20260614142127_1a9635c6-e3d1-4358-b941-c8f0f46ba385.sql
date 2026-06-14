-- Rename the patient -> pro link from "logopedist" to the broader
-- "healthcare provider" (prestataire de soins): the followed pro may be a
-- logopedist, audiologist, physiotherapist, or any other health professional.
--
-- The column was already added (and deployed) by 20260614130000; this only
-- renames it in place, so the existing FK and any stored values are preserved.
ALTER TABLE public.profiles
  RENAME COLUMN logopedist_id TO healthcare_provider_id;

-- Keep the auto-generated FK constraint name in sync with the new column name.
ALTER TABLE public.profiles
  RENAME CONSTRAINT profiles_logopedist_id_fkey TO profiles_healthcare_provider_id_fkey;