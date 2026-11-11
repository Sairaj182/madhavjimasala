import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Madhavji Masala",
    short_name: "Madhavji",
    description: "Pure spices, authentic taste, and convenient general-store pickup.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf6ed",
    theme_color: "#8b1a1a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/madhavjimasala_logo_tbg.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
