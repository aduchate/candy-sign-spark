# Pro / Patient Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the cosmetic "Pro de santé" / "Patient signant" dashboard sections into real, mutually-exclusive account types that gate which features each user sees, reusing the existing `user_roles` + `has_role()` authorization layer.

**Architecture:** Extend the existing `app_role` enum with `pro` and `patient`. These two are mutually exclusive (enforced by a partial unique index); `admin` and the base `user` role remain orthogonal. The type is **self-declared at onboarding** via a `SECURITY DEFINER` RPC `set_account_type()` that atomically swaps the user's account-type row. The frontend gains a single `useUserRoles` hook and a `ProtectedRoute` guard; the Dashboard menu shows the "Pro" / "Patient" sections based on the user's role instead of always showing both.

**Tech Stack:** Supabase (PostgreSQL + RLS), React 18 + TypeScript, TanStack React Query, react-router-dom v6, react-hook-form + zod.

---

## Testing approach (read first)

**This project has no automated test framework configured** (confirmed in `CLAUDE.md`). Do **not** invent `vitest`/`jest` commands — they will not run. Each task is verified with the strongest mechanism actually available:

- **Database tasks** — apply the migration, then run real SQL assertions in the Supabase SQL editor (or `psql`). These SQL checks **are** the tests for the DB layer; treat a failing assertion exactly like a failing unit test.
- **Frontend tasks** — `npm run build` (this runs `tsc` and fails on type errors) + `npm run lint`, followed by explicit manual browser checks on `npm run dev` (port 8080).

If the team later adds Vitest, the hook in Task 4 is the natural first unit-test target — but adding a test framework is **out of scope** for this plan.

**Migration application.** Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:
- Against the linked remote project: `supabase db push`
- Or reset a local stack: `supabase db reset`

If the CLI is not linked in this environment, paste each migration's SQL into the Supabase Dashboard → SQL editor for project `mhingidepseiyozqyova`, in filename order.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `supabase/migrations/20260612120000_add_account_type_enum.sql` | Add `pro` + `patient` to `app_role` enum (alone, in its own transaction) | Create |
| `supabase/migrations/20260612120100_account_type_constraints.sql` | Mutual-exclusivity index + `set_account_type()` RPC + grant | Create |
| `src/integrations/supabase/types.ts` | Generated DB types — extend enum union + add RPC signature | Modify |
| `src/hooks/useUserRoles.ts` | Single source of truth for the current user's roles + `isAdmin/isPro/isPatient` flags | Create |
| `src/components/ProtectedRoute.tsx` | Route guard: requires auth, optionally a specific role | Create |
| `src/App.tsx` | Wrap `/admin` in `ProtectedRoute requireRole="admin"` | Modify |
| `src/components/OnboardingQuestionnaire.tsx` | Add required account-type choice; call `set_account_type` RPC on submit | Modify |
| `src/pages/Dashboard.tsx` | Gate "Pro" / "Patient" menu groups by role; redirect users with no account type to onboarding | Modify |

> **Why two migration files?** PostgreSQL forbids *using* a newly-added enum value in the same transaction that adds it ("unsafe use of new value"). Supabase runs each migration file in its own transaction. The index predicate and the RPC body both reference `'pro'`/`'patient'`, so they **must** live in a second file that runs after the first has committed. Do not merge them.

---

## Task 1: Migration — add `pro` and `patient` to the enum

**Files:**
- Create: `supabase/migrations/20260612120000_add_account_type_enum.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Add the two account-type values to the existing app_role enum.
-- NOTE: these values cannot be USED (in indexes, policies, function bodies)
-- in this same transaction — that is done in the next migration.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'patient';
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push` (or paste into the SQL editor).
Expected: completes without error.

- [ ] **Step 3: Verify the enum values exist**

Run this in the SQL editor:

```sql
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'public.app_role'::regtype
ORDER BY enumsortorder;
```

Expected output: four rows — `admin`, `user`, `pro`, `patient`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260612120000_add_account_type_enum.sql
git commit -m "feat(db): add pro and patient values to app_role enum"
```

---

## Task 2: Migration — exclusivity constraint + `set_account_type()` RPC

**Files:**
- Create: `supabase/migrations/20260612120100_account_type_constraints.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Enforce mutual exclusivity: a user may hold AT MOST ONE of (pro, patient).
-- admin / user rows are untouched (not covered by the predicate).
CREATE UNIQUE INDEX IF NOT EXISTS one_account_type_per_user
  ON public.user_roles (user_id)
  WHERE role IN ('pro', 'patient');

-- Atomic self-service setter for the caller's own account type.
-- SECURITY DEFINER so it can write user_roles without a broad self-INSERT
-- policy (which would risk admin self-escalation). It hard-rejects any role
-- other than pro/patient, so it can never grant admin.
CREATE OR REPLACE FUNCTION public.set_account_type(_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _role NOT IN ('pro', 'patient') THEN
    RAISE EXCEPTION 'invalid account type: %', _role;
  END IF;

  -- Remove any existing account type, then set the new one (atomic in one tx).
  DELETE FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('pro', 'patient');

  INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), _role);
END;
$$;

-- Only logged-in users may call it; never anon/public.
REVOKE EXECUTE ON FUNCTION public.set_account_type(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_account_type(public.app_role) TO authenticated;
```

- [ ] **Step 2: Apply the migration**

Run: `supabase db push` (or paste into the SQL editor).
Expected: completes without error.

- [ ] **Step 3: Verify exclusivity + the RPC (the DB-layer test)**

Run in the SQL editor. This impersonates a real user via a temporary GUC so `auth.uid()` resolves; replace the UUID with any existing `auth.users.id`:

```sql
-- pick a real user id
\set uid '00000000-0000-0000-0000-000000000000'  -- replace with a real auth.users.id

-- 1) set to pro
SELECT set_config('request.jwt.claim.sub', :'uid', true);
SELECT public.set_account_type('pro');
SELECT role FROM public.user_roles WHERE user_id = :'uid' AND role IN ('pro','patient');
-- Expected: exactly one row -> 'pro'

-- 2) switch to patient — must REPLACE, not add
SELECT public.set_account_type('patient');
SELECT role FROM public.user_roles WHERE user_id = :'uid' AND role IN ('pro','patient');
-- Expected: exactly one row -> 'patient'  (exclusivity held)

-- 3) rejecting an invalid type
SELECT public.set_account_type('admin');
-- Expected: ERROR "invalid account type: admin"
```

> If `set_config('request.jwt.claim.sub', ...)` does not make `auth.uid()` resolve in your SQL-editor session, run steps 1–3 instead from the app as a logged-in user (Task 6) and confirm the same single-row outcomes by inspecting `user_roles`.

- [ ] **Step 4: Verify the unique index blocks a manual double-insert**

```sql
-- Attempt to give the same user BOTH types directly (bypassing the RPC):
INSERT INTO public.user_roles (user_id, role) VALUES (:'uid', 'pro');
INSERT INTO public.user_roles (user_id, role) VALUES (:'uid', 'patient');
-- Expected: the second INSERT fails with a unique-violation on
-- "one_account_type_per_user". Roll back / clean up afterwards.
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260612120100_account_type_constraints.sql
git commit -m "feat(db): mutual-exclusivity index and set_account_type RPC"
```

---

## Task 3: Update the generated DB types

The Supabase client is typed off `src/integrations/supabase/types.ts`. Until it knows about the new enum values and the RPC, `supabase.rpc("set_account_type", ...)` and `roles.includes("pro")` will fail type-checking. Edit it by hand (regeneration via `supabase gen types` is equivalent but needs a linked CLI).

**Files:**
- Modify: `src/integrations/supabase/types.ts:527` (enum union)
- Modify: `src/integrations/supabase/types.ts:656` (enum constants array)
- Modify: `src/integrations/supabase/types.ts:517-524` (Functions block — add RPC)

- [ ] **Step 1: Extend the enum union**

Replace line 527:

```ts
      app_role: "admin" | "user"
```

with:

```ts
      app_role: "admin" | "user" | "pro" | "patient"
```

- [ ] **Step 2: Extend the enum constants array**

Replace line 656:

```ts
      app_role: ["admin", "user"],
```

with:

```ts
      app_role: ["admin", "user", "pro", "patient"],
```

- [ ] **Step 3: Add the RPC signature to the Functions block**

In the `Functions:` block (currently lines 517–525), add `set_account_type` after the `has_role` entry so it reads:

```ts
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_account_type: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
    }
```

- [ ] **Step 4: Verify the types compile**

Run: `npm run build`
Expected: build succeeds (no TypeScript errors).

- [ ] **Step 5: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore(types): add pro/patient enum values and set_account_type RPC"
```

---

## Task 4: `useUserRoles` hook

Centralizes role fetching that is currently copy-pasted into `Dashboard.tsx:157-161` and `Admin.tsx:113-118`.

**Files:**
- Create: `src/hooks/useUserRoles.ts`

- [ ] **Step 1: Write the hook**

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Fetches the current user's roles once and exposes derived flags.
 * Returns an empty role list when logged out (e.g. offline mode).
 */
export function useUserRoles() {
  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;

      return (data ?? []).map((r) => r.role);
    },
  });

  const roles = query.data ?? [];

  return {
    roles,
    isLoadingRoles: query.isLoading,
    isAdmin: roles.includes("admin"),
    isPro: roles.includes("pro"),
    isPatient: roles.includes("patient"),
    hasAccountType: roles.includes("pro") || roles.includes("patient"),
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors in `src/hooks/useUserRoles.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useUserRoles.ts
git commit -m "feat(auth): add useUserRoles hook"
```

---

## Task 5: `ProtectedRoute` guard + protect `/admin`

Replaces ad-hoc, mount-time auth checks with a declarative guard. **Note:** do NOT wrap `/dashboard` with this — `Dashboard.tsx:92-144` has bespoke offline-mode logic that intentionally allows unauthenticated access when offline. `Admin` already has a server-side check (`Admin.tsx:101-133`); the guard adds a client-side gate in front of it (defense in depth) and is the reusable primitive for any future pro/patient-only routes.

**Files:**
- Create: `src/components/ProtectedRoute.tsx`
- Modify: `src/App.tsx:12` (import) and `src/App.tsx:32` (route)

- [ ] **Step 1: Write the guard**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, the user must hold this role or they are sent to /dashboard. */
  requireRole?: AppRole;
}

export const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { roles, isLoadingRoles } = useUserRoles();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthed(true);
      }
      setAuthChecked(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (!authChecked || !isAuthed || isLoadingRoles) return;
    if (requireRole && !roles.includes(requireRole)) {
      navigate("/dashboard");
    }
  }, [authChecked, isAuthed, isLoadingRoles, requireRole, roles, navigate]);

  // Render nothing until we know the user is allowed (avoids flashing content).
  if (!authChecked || !isAuthed || isLoadingRoles) return null;
  if (requireRole && !roles.includes(requireRole)) return null;

  return <>{children}</>;
};
```

- [ ] **Step 2: Import it in `App.tsx`**

Add after line 13 (`import NotFound from "./pages/NotFound";`):

```tsx
import { ProtectedRoute } from "./components/ProtectedRoute";
```

- [ ] **Step 3: Wrap the `/admin` route**

Replace `src/App.tsx:32`:

```tsx
          <Route path="/admin" element={<Admin />} />
```

with:

```tsx
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
```

- [ ] **Step 4: Verify build + manual check**

Run: `npm run build`
Expected: build succeeds.

Then `npm run dev` and verify:
- Logged out → visiting `/admin` redirects to `/auth`.
- Logged in as a non-admin → `/admin` redirects to `/dashboard` (no admin UI flashes).
- Logged in as an admin → `/admin` renders normally.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProtectedRoute.tsx src/App.tsx
git commit -m "feat(auth): add ProtectedRoute and guard /admin"
```

---

## Task 6: Onboarding — choose account type and persist it

Adds a required "Type de compte" choice to the onboarding form and calls the `set_account_type` RPC on submit, right after the profile update succeeds.

**Files:**
- Modify: `src/components/OnboardingQuestionnaire.tsx` (schema at 15-25, submit at 45-79, form UI around 150)

- [ ] **Step 1: Add `account_type` to the zod schema**

In the `onboardingSchema` object (lines 15-25), add this field (e.g. after the `hearing_status` field on line 22):

```ts
  account_type: z.enum(["pro", "patient"], {
    required_error: "Veuillez sélectionner un type de compte",
  }),
```

- [ ] **Step 2: Persist the account type in `onSubmit`**

In `onSubmit`, after the existing profile-update error check (`if (error) throw error;` on line 69) and before `toast.success(...)` on line 71, insert:

```ts
      const { error: roleError } = await supabase.rpc("set_account_type", {
        _role: data.account_type,
      });
      if (roleError) throw roleError;
```

- [ ] **Step 3: Add the account-type radio group to the form**

In the JSX, immediately after the "Statut auditif" block (which ends at line 171, before the "Raison d'installation" block at line 173), insert:

```tsx
            {/* Type de compte */}
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setValue("account_type", value as OnboardingFormData["account_type"], {
                    shouldValidate: true,
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pro" id="account_pro" />
                  <Label htmlFor="account_pro" className="font-normal cursor-pointer">
                    Pro de santé
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="account_patient" />
                  <Label htmlFor="account_patient" className="font-normal cursor-pointer">
                    Patient signant
                  </Label>
                </div>
              </RadioGroup>
              {errors.account_type && (
                <p className="text-sm text-destructive">{errors.account_type.message}</p>
              )}
            </div>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds. (`RadioGroup`, `RadioGroupItem`, `Label` are already imported at the top of the file.)

- [ ] **Step 5: Manual end-to-end check**

`npm run dev`, sign in as a fresh user, complete onboarding choosing "Pro de santé". Then in the Supabase SQL editor:

```sql
SELECT role FROM public.user_roles
WHERE user_id = '<that-user-id>' AND role IN ('pro','patient');
```

Expected: exactly one row, `pro`. Repeat choosing "Patient signant" with another user → exactly one row, `patient`.

- [ ] **Step 6: Commit**

```bash
git add src/components/OnboardingQuestionnaire.tsx
git commit -m "feat(onboarding): let users choose pro or patient account type"
```

---

## Task 7: Gate the Dashboard menu by account type

Today `Dashboard.tsx:312-365` always renders BOTH "Pro de santé" and "Patient signant" groups. Gate each by the user's role, reuse `useUserRoles` for the admin flag, and send authenticated users who have no account type yet (pre-existing accounts) to onboarding to pick one.

**Files:**
- Modify: `src/pages/Dashboard.tsx` — import + hook (top), redirect (in the auth effect ~104-122), menu gating (312-365), remove local admin check (88, 157-161)

- [ ] **Step 1: Import the hook**

Add after line 39 (`import { useOnlineStatus } from "@/hooks/useOnlineStatus";`):

```tsx
import { useUserRoles } from "@/hooks/useUserRoles";
```

- [ ] **Step 2: Use the hook and drop the local admin state**

Replace line 88:

```tsx
  const [isAdmin, setIsAdmin] = useState(false);
```

with:

```tsx
  const { isAdmin, isPro, isPatient, hasAccountType, isLoadingRoles } = useUserRoles();
```

- [ ] **Step 3: Delete the now-dead `checkAdminStatus` function and its calls**

Remove the `checkAdminStatus` definition (lines 157-161) and the two calls `checkAdminStatus(session.user.id);` (line 121 and line 139). The hook now supplies `isAdmin`.

- [ ] **Step 4: Redirect authenticated users without an account type to onboarding**

In the auth effect, inside the `else` branch where a session exists (after `setUser(session.user);` on line 119, before `fetchUserProgress`), add a redirect. Because `useUserRoles` resolves asynchronously, guard on its loading flag with a dedicated effect added right after the existing auth `useEffect` (after line 144):

```tsx
  // Send logged-in users who have not picked an account type to onboarding.
  useEffect(() => {
    if (loading || isLoadingRoles || isOfflineMode) return;
    if (user && !hasAccountType) {
      navigate("/onboarding");
    }
  }, [loading, isLoadingRoles, isOfflineMode, user, hasAccountType, navigate]);
```

- [ ] **Step 5: Gate the "Pro de santé" menu group**

Wrap the existing "Pro de santé" group (the `<div>` spanning lines 312-338) so it only renders for pros. Change the opening of that block from:

```tsx
            <div>
              <Button
                onClick={() => setNotionOpen(!notionOpen)}
```

to:

```tsx
            {isPro && (
            <div>
              <Button
                onClick={() => setNotionOpen(!notionOpen)}
```

and close it by changing the matching `</div>` on line 338 from:

```tsx
              )}
            </div>
```

to:

```tsx
              )}
            </div>
            )}
```

- [ ] **Step 6: Gate the "Patient signant" menu group**

Apply the same wrapping to the "Patient signant" group (lines 339-365). Change the opening from:

```tsx
            <div>
              <Button
                onClick={() => setMedicalOpen(!medicalOpen)}
```

to:

```tsx
            {isPatient && (
            <div>
              <Button
                onClick={() => setMedicalOpen(!medicalOpen)}
```

and close it by changing the matching `</div>` on line 365 from:

```tsx
              )}
            </div>
```

to:

```tsx
              )}
            </div>
            )}
```

> The "Administration" button at lines 373-378 already keys off `isAdmin`, which now comes from the hook — no change needed there.

- [ ] **Step 7: Verify build + lint**

Run: `npm run build && npm run lint`
Expected: build succeeds; no new lint errors. (If `notionOpen`/`medicalOpen`/`setActiveSection` become flagged as unused for a role that never sees them, that is acceptable — they are still used by the rendered branch.)

- [ ] **Step 8: Manual check**

`npm run dev`:
- Log in as a **pro** user → only "Pro de santé" group shows; "Patient signant" is absent.
- Log in as a **patient** user → only "Patient signant" group shows.
- Log in as an **admin** who is also pro/patient → their account-type group shows AND the "Administration" link shows.
- Log in as a pre-existing user with **no** account type → redirected to `/onboarding`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dashboard): gate pro/patient sections by account type"
```

---

## Task 8 (template, optional): RLS for future type-specific data

There is no pro-only or patient-only **data table** yet (the menu sections currently render static/shared components). When one is added (e.g. a `appointments` table for the patient "Prise de rendez-vous" flow), gate it with the same `has_role()` pattern the rest of the schema uses. This task is a **reference template** — implement it only when such a table exists.

**Files:**
- Create (when applicable): a new migration `supabase/migrations/<timestamp>_<table>_rls.sql`

- [ ] **Template policy** (adapt table/columns):

```sql
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients manage only their own appointments.
CREATE POLICY "patients manage own appointments"
  ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'patient') AND user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'patient') AND user_id = auth.uid());

-- Example: pros read patient-shared content.
CREATE POLICY "pros read shared content"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pro'));
```

- [ ] **Verify** with SQL assertions analogous to Task 2, Step 3 (set the JWT sub to a pro vs patient user and confirm the rows each can/can't see).

---

## Self-Review notes

- **Spec coverage:** enum extension (T1), exclusivity + atomic setter (T2), type plumbing (T3), centralized role read (T4), route guard for admin (T5), self-declared choice at onboarding (T6), menu gating + pre-existing-user redirect (T7), future data RLS template (T8). All sketch points covered.
- **Mutual exclusivity** is enforced at the DB (partial unique index) *and* by the RPC's delete-then-insert — not left to the UI.
- **No admin self-escalation:** `set_account_type` hard-rejects anything but `pro`/`patient`; admin remains exclusively behind the `manage-user-role` edge function. No broad self-INSERT policy on `user_roles` is introduced.
- **Type consistency:** `set_account_type(_role)` / `useUserRoles` flags (`isPro`/`isPatient`/`hasAccountType`) / `ProtectedRoute requireRole` use consistent names across DB, types, hook, and components.
- **Offline mode preserved:** `/dashboard` is deliberately NOT wrapped in `ProtectedRoute`; the account-type redirect is guarded by `isOfflineMode` and the role loading flag.
