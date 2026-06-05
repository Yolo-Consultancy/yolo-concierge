/* eslint-disable prettier/prettier */
import { useState, type FormEvent } from "react";
import { Lock, User } from "lucide-react";
import { login } from "@/lib/admin/auth";
import { adminConfig } from "@/config/admin";

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (login(username, password)) onSuccess();
    else setError("Identifiants incorrects.");
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

        <p className="text-sm text-muted-foreground mb-5">
          Accès réservé à l'équipe YOLO. Connectez-vous avec votre identifiant administrateur.
        </p>

        <label className="block text-sm font-medium mb-2">Identifiant</label>
        <div className="relative mb-4">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            placeholder="admin@yolo.cd"
            autoFocus
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="block text-sm font-medium mb-2">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
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
