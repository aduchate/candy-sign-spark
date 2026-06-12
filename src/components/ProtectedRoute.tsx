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
