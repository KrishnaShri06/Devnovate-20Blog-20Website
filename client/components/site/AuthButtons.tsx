import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function initials(name: string) {
  const parts = name.trim().split(" ");
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export function AuthButtons() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <>
        <Button variant="ghost" onClick={() => navigate("/login")}>
          Log in
        </Button>
        <Button variant="outline" onClick={() => navigate("/signup")}>
          Sign up
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        Dashboard
      </Button>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
        {initials(user.name)}
      </span>
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
