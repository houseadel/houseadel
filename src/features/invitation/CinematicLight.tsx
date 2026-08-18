import { useEffect, useRef } from "react";
import { motionIsReduced } from "../../lib/preferences";

type CinematicLightProps = {
  className?: string;
  tone?: "gold" | "ember";
  scene?: "overlay" | "opening" | "countdown" | "rsvp" | "closing";
};

export function CinematicLight({ className = "", tone = "gold", scene = "overlay" }: CinematicLightProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = !document.hidden;
    let pointerX = 0.66;
    let pointerY = 0.35;
    const reduced = motionIsReduced();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const phase = reduced ? 0 : time * 0.00018;

      if (scene !== "overlay") {
        const base = context.createLinearGradient(0, 0, width, height);
        if (scene === "opening") {
          base.addColorStop(0, "#80644f");
          base.addColorStop(0.42, "#d2b58f");
          base.addColorStop(1, "#f0dfc4");
        } else if (scene === "countdown") {
          base.addColorStop(0, "#211918");
          base.addColorStop(0.58, "#4d362a");
          base.addColorStop(1, "#87664d");
        } else if (scene === "rsvp") {
          base.addColorStop(0, "#aa8c70");
          base.addColorStop(0.5, "#d8c4a9");
          base.addColorStop(1, "#f2e8d8");
        } else {
          base.addColorStop(0, "#050908");
          base.addColorStop(0.5, "#14211d");
          base.addColorStop(1, "#050908");
        }
        context.fillStyle = base;
        context.fillRect(0, 0, width, height);
      }

      if (scene === "opening") {
        const sunX = width * 0.53 + Math.sin(phase) * width * 0.018;
        const sunY = height * 0.49;
        const sun = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, height) * 0.62);
        sun.addColorStop(0, "rgba(255,250,225,.98)");
        sun.addColorStop(0.48, "rgba(255,237,199,.78)");
        sun.addColorStop(1, "rgba(255,222,178,0)");
        context.fillStyle = sun;
        context.fillRect(0, 0, width, height);
        context.save();
        context.filter = "blur(38px)";
        context.fillStyle = "rgba(44,29,21,.25)";
        context.translate(width * (0.16 + Math.sin(phase * 0.7) * 0.025), height * 0.42);
        context.rotate(-0.13 + Math.sin(phase * 0.5) * 0.025);
        context.beginPath();
        context.ellipse(0, 0, width * 0.13, height * 0.82, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      if (scene === "countdown") {
        const cx = width * (width < 700 ? 0.64 : 0.68);
        const cy = height * (width < 700 ? 0.31 : 0.48);
        const scale = 1 + Math.sin(phase * 2.2) * 0.025;
        context.strokeStyle = "rgba(249,219,171,.25)";
        context.lineWidth = 1;
        [0.18, 0.27].forEach((radius) => {
          context.beginPath();
          context.arc(cx, cy, Math.min(width, height) * radius * scale, 0, Math.PI * 2);
          context.stroke();
        });
        const point = context.createRadialGradient(cx, cy, 0, cx, cy, 34);
        point.addColorStop(0, "rgba(255,225,169,.95)");
        point.addColorStop(1, "rgba(255,192,103,0)");
        context.fillStyle = point;
        context.fillRect(cx - 34, cy - 34, 68, 68);
      }

      if (scene === "rsvp") {
        context.save();
        context.globalCompositeOperation = "screen";
        context.strokeStyle = "rgba(255,250,232,.18)";
        context.lineWidth = Math.max(90, width * 0.1);
        context.filter = "blur(22px)";
        for (let index = 0; index < 3; index += 1) {
          const offset = Math.sin(phase + index) * width * 0.025;
          context.beginPath();
          context.moveTo(-width * 0.1, height * (0.18 + index * 0.22));
          context.bezierCurveTo(width * 0.32 + offset, height * (0.02 + index * 0.2), width * 0.56 - offset, height * (0.72 - index * 0.08), width * 1.1, height * (0.34 + index * 0.19));
          context.stroke();
        }
        context.restore();
      }

      if (scene === "closing") {
        const cx = width * 0.5;
        const cy = height * 0.52;
        const radius = Math.min(width, height) * 0.34;
        context.strokeStyle = "rgba(229,192,139,.2)";
        context.lineWidth = 1;
        [1, 1.35, 1.72].forEach((ring) => {
          context.beginPath();
          context.arc(cx, cy, radius * ring, 0, Math.PI * 2);
          context.stroke();
        });
        context.fillStyle = "rgba(241,211,165,.34)";
        for (let index = 0; index < 42; index += 1) {
          const x = (Math.sin(index * 92.41) * 0.5 + 0.5) * width;
          const y = (Math.sin(index * 47.17 + 2) * 0.5 + 0.5) * height;
          const twinkle = 0.35 + (Math.sin(phase * 4 + index) + 1) * 0.3;
          context.globalAlpha = twinkle;
          context.fillRect(x, y, 1, 1);
        }
        context.globalAlpha = 1;
      }

      const drift = reduced ? 0 : Math.sin(time * 0.00017) * width * 0.018;
      const x = pointerX * width + drift;
      const y = pointerY * height;
      const radius = Math.max(width, height) * (tone === "gold" ? 0.54 : 0.36);
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      if (tone === "gold") {
        glow.addColorStop(0, "rgba(255, 225, 174, .28)");
        glow.addColorStop(0.12, "rgba(240, 173, 96, .12)");
        glow.addColorStop(1, "rgba(197, 110, 44, 0)");
      } else {
        glow.addColorStop(0, "rgba(255, 187, 112, .20)");
        glow.addColorStop(0.2, "rgba(192, 102, 43, .07)");
        glow.addColorStop(1, "rgba(105, 43, 20, 0)");
      }
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "screen";
      const flare = context.createLinearGradient(0, 0, width, 0);
      flare.addColorStop(0, "rgba(255,215,156,0)");
      flare.addColorStop(Math.max(0, pointerX - 0.03), "rgba(255,221,170,.05)");
      flare.addColorStop(pointerX, tone === "gold" ? "rgba(255,241,208,.42)" : "rgba(255,190,112,.28)");
      flare.addColorStop(Math.min(1, pointerX + 0.03), "rgba(255,221,170,.05)");
      flare.addColorStop(1, "rgba(255,215,156,0)");
      context.fillStyle = flare;
      context.fillRect(0, y - 0.5, width, 1);
      context.restore();

      if (!reduced && visible) frame = window.requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX += ((event.clientX - rect.left) / rect.width - pointerX) * 0.16;
      pointerY += ((event.clientY - rect.top) / rect.height - pointerY) * 0.12;
    };
    const visibility = () => {
      visible = !document.hidden;
      window.cancelAnimationFrame(frame);
      if (visible && !reduced) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [scene, tone]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
