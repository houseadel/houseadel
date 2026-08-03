import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ApplicationValues } from "../applicationSchema";
import styles from "./TurnstileField.module.css";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "light";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
};

const SCRIPT_ID = "house-adel-turnstile";
const SCRIPT_SOURCE = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function getTurnstile() {
  return (window as typeof window & { turnstile?: TurnstileApi }).turnstile;
}

function loadTurnstile() {
  const ready = getTurnstile();
  if (ready) return Promise.resolve(ready);

  return new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const handleLoad = () => {
      const api = getTurnstile();
      if (api) resolve(api);
      else reject(new Error("Turnstile loaded without an available widget API."));
    };
    const handleError = () => reject(new Error("Turnstile could not be loaded."));

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SOURCE;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });
}

export function TurnstileField() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const container = useRef<HTMLDivElement>(null);
  const { setValue } = useFormContext<ApplicationValues>();
  const [status, setStatus] = useState("Preparing spam protection.");

  useEffect(() => {
    if (!siteKey || !container.current) return;
    let active = true;
    let api: TurnstileApi | undefined;
    let widgetId: string | undefined;

    loadTurnstile()
      .then((loadedApi) => {
        if (!active || !container.current) return;
        api = loadedApi;
        widgetId = loadedApi.render(container.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            if (!active) return;
            setValue("turnstileToken", token, { shouldValidate: true });
            setStatus("Spam protection complete.");
          },
          "expired-callback": () => {
            if (!active) return;
            setValue("turnstileToken", "", { shouldValidate: true });
            setStatus("Spam protection expired. Complete it again before sending.");
          },
          "error-callback": () => {
            if (!active) return;
            setValue("turnstileToken", "", { shouldValidate: true });
            setStatus("Spam protection is unavailable. Please try again before sending.");
          },
        });
      })
      .catch(() => {
        if (active) setStatus("Spam protection is unavailable. Please try again before sending.");
      });

    return () => {
      active = false;
      setValue("turnstileToken", "", { shouldValidate: false });
      if (api && widgetId) api.remove(widgetId);
    };
  }, [setValue, siteKey]);

  if (!siteKey) return null;

  return (
    <section className={styles.field} aria-labelledby="turnstile-heading">
      <div>
        <h3 id="turnstile-heading">Spam protection</h3>
        <p>A short verification protects the application from automated submissions.</p>
      </div>
      <div className={styles.widget} ref={container} />
      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
