"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { startDemoAction } from "../../(app)/actions";
import styles from "./login.module.css";

const views = {
  signIn: {
    title: "Sign in",
    action: "Sign in",
    unavailable: "Email sign-in isn’t connected. No credentials were sent.",
  },
  register: {
    title: "Create an account",
    action: "Create account",
    unavailable: "Account creation isn’t connected. No account was created.",
  },
  recovery: {
    title: "Reset your password",
    action: "Send reset link",
    unavailable: "Password reset isn’t connected. No reset email was sent.",
  },
};

type View = keyof typeof views;
type Errors = { email?: string; password?: string };

function DemoActivation() {
  const router = useRouter();
  const [error, start, pending] = useActionState(async () => {
    try {
      if ((await startDemoAction()).ok) {
        router.replace("/explore");
        return "";
      }
    } catch {
      // Keep guest browsing available when the session store cannot be reached.
    }
    return "Couldn’t start the demo. Try again or browse as a guest.";
  }, "");

  return (
    <form action={start} className={styles.demoForm}>
      <button type="submit" disabled={pending} className={styles.primary}>
        {pending ? "Starting demo…" : "Try Demo as Karthik"}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

export default function AuthPreview({ demoEnabled, activePersona }: {
  demoEnabled: boolean;
  activePersona: string | null;
}) {
  const [mode, setMode] = useState<View>("signIn");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const changedView = useRef(false);
  const view = views[mode];

  useEffect(() => {
    if (changedView.current) heading.current?.focus();
  }, [mode]);

  function showView(next: View) {
    changedView.current = true;
    setMode(next);
    setPasswordVisible(false);
    setErrors({});
    setNotice("");
  }

  function checkCredentials() {
    const issues: Errors = {};
    if (!email.current?.value.trim()) issues.email = "Enter an email address.";
    else if (email.current.validity.typeMismatch) issues.email = "Enter a valid email address.";
    if (mode !== "recovery" && !password.current?.value) issues.password = "Enter a password.";
    setErrors(issues);
    if (issues.email || issues.password) {
      setNotice("");
      if (issues.email) email.current?.focus();
      else password.current?.focus();
    } else {
      setNotice(view.unavailable);
    }
  }

  function checkOnEnter(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement && !event.nativeEvent.isComposing) {
      event.preventDefault();
      checkCredentials();
    }
  }

  function clearError(field: keyof Errors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice("");
  }

  return (
    <main className={styles.layout}>
      <section className={styles.card} aria-labelledby="auth-heading">
        <div className={styles.cardHeading}>
          <h1 id="auth-heading" ref={heading} tabIndex={-1}>{view.title}</h1>
          <p>Authentication preview. Use sample values only.</p>
        </div>

        <div key={mode} className={styles.fields} onKeyDown={checkOnEnter}>
          <div className={styles.field}>
            <label htmlFor="preview-email">Email address</label>
            <input
              ref={email}
              id="preview-email"
              type="email"
              autoComplete="off"
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "preview-email-error" : undefined}
              onChange={() => clearError("email")}
            />
            {errors.email && <p className={styles.error} id="preview-email-error" role="alert">{errors.email}</p>}
          </div>
          {mode !== "recovery" && (
            <>
              <div className={styles.field}>
                <label htmlFor="preview-password">Password</label>
                <div className={styles.password}>
                  <input
                    ref={password}
                    id="preview-password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="off"
                    aria-required="true"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "preview-password-error" : undefined}
                    onChange={() => clearError("password")}
                  />
                  <button
                    type="button"
                    className={styles.reveal}
                    aria-controls="preview-password"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    onClick={() => setPasswordVisible((visible) => !visible)}
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className={styles.error} id="preview-password-error" role="alert">{errors.password}</p>}
              </div>
              {mode === "signIn" && (
                <button type="button" className={styles.textButton} onClick={() => showView("recovery")}>Forgot password?</button>
              )}
            </>
          )}
          <button type="button" className={styles.primary} onClick={checkCredentials}>{view.action}</button>
        </div>

        {mode !== "recovery" && (
          <button
            type="button"
            className={styles.google}
            onClick={() => setNotice("Google sign-in isn’t connected. No account information was sent.")}
          >
            Continue with Google
          </button>
        )}
        <div role="status">{notice && <p className={styles.notice}>{notice}</p>}</div>

        <div className={styles.switchView}>
          {mode === "signIn" ? (
            <p>New to EventConnect? <button type="button" className={styles.textButton} onClick={() => showView("register")}>Create account</button></p>
          ) : (
            <button type="button" className={styles.textButton} onClick={() => showView("signIn")}>Back to sign in</button>
          )}
        </div>
      </section>

      <aside className={styles.entry} aria-labelledby="entry-heading">
        <h2 id="entry-heading">Explore Bengaluru</h2>
        {activePersona ? (
          <>
            <p>Browsing as <strong>{activePersona}</strong>. Continue with your current demo session.</p>
            <a href="/explore" className={styles.primary}>Continue demo</a>
          </>
        ) : (
          <>
            <p>Browse sample events as a guest{demoEnabled ? " or try networking with a fictional demo persona" : ""}.</p>
            <div className={styles.entryActions}>
              <a href="/explore" className={styles.guest}>Browse as guest</a>
              {demoEnabled && <DemoActivation />}
            </div>
          </>
        )}
      </aside>
    </main>
  );
}
