/* eslint-disable prettier/prettier */
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { login } from "@/lib/admin/auth";
import { adminConfig } from "@/config/admin";

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (login(password)) onSuccess();
    else setError("Mot de passe incorrect.");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold">{adminConfig.brand.title}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              {adminConfig.brand.subtitle}
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium mb-2">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          autoFocus
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="text-destructive text-xs mt-2">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Se connecter
        </button>

        <p className="mt-5 text-[11px] text-muted-foreground text-center">
          Auth temporaire — à remplacer par votre API Express.
        </p>
      </form>
    </div>
  );
}
