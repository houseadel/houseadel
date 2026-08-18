import * as THREE from "three";
import type { Project } from "../../data/work";

/**
 * Draws a project's card face.
 *
 * The type belongs to the card, not to the page: a caption pinned to the corner
 * of the screen is a label about the object, while type printed on the face is
 * part of it, and it turns and recedes with the card the way it would on a real
 * plate.
 *
 * Drawn on a 2D canvas rather than built from geometry because it is text — the
 * browser already has the best text renderer available, and a canvas texture
 * costs one upload per project.
 */
const WIDTH = 1024;
const HEIGHT = 640;

export function drawCardFace(project: Project, language: "en" | "id"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);

  context.fillStyle = "#0b0a09";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  // A hairline inset frame, the same device the rest of the site uses for an edge.
  context.strokeStyle = "rgba(242, 239, 233, 0.22)";
  context.lineWidth = 2;
  context.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);

  context.textBaseline = "alphabetic";
  context.fillStyle = "rgba(242, 239, 233, 0.55)";
  context.font = "700 26px ui-sans-serif, system-ui, sans-serif";
  context.letterSpacing = "6px";
  context.fillText(project.year.toUpperCase(), 72, 116);

  context.fillStyle = "#f6f3ee";
  context.font = "300 92px 'Newsreader Variable', Georgia, serif";
  context.letterSpacing = "0px";
  context.fillText(project.title, 72, 320);

  context.fillStyle = "rgba(242, 239, 233, 0.7)";
  context.font = "300 34px 'Newsreader Variable', Georgia, serif";
  const sentence = language === "en" ? project.sentence.en : project.sentence.id;
  wrap(context, sentence, 72, 396, WIDTH - 144, 46);

  context.fillStyle = "rgba(242, 239, 233, 0.42)";
  context.font = "700 22px ui-sans-serif, system-ui, sans-serif";
  context.letterSpacing = "5px";
  const tags = project.disciplines.slice(0, 3).join("   ").toUpperCase();
  context.fillText(tags, 72, HEIGHT - 88);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function wrap(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let offset = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + offset);
      line = word;
      offset += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, y + offset);
}
