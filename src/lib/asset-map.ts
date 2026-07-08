// Maps DB image paths like "/src/assets/p-headphones.jpg" to imported Vite asset URLs.
// This ensures product images work in production builds where /src paths are rewritten.

import headphones from "@/assets/p-headphones.jpg";
import watch from "@/assets/p-watch.jpg";
import sneakers from "@/assets/p-sneakers.jpg";
import perfume from "@/assets/p-perfume.jpg";
import phone from "@/assets/p-phone.jpg";
import sweater from "@/assets/p-sweater.jpg";
import lamp from "@/assets/p-lamp.jpg";
import bag from "@/assets/p-bag.jpg";

const MAP: Record<string, string> = {
  "/src/assets/p-headphones.jpg": headphones,
  "/src/assets/p-watch.jpg": watch,
  "/src/assets/p-sneakers.jpg": sneakers,
  "/src/assets/p-perfume.jpg": perfume,
  "/src/assets/p-phone.jpg": phone,
  "/src/assets/p-sweater.jpg": sweater,
  "/src/assets/p-lamp.jpg": lamp,
  "/src/assets/p-bag.jpg": bag,
};

export function resolveImage(url: string | null | undefined): string {
  if (!url) return lamp;
  if (url.startsWith("http")) return url;
  return MAP[url] ?? lamp;
}
