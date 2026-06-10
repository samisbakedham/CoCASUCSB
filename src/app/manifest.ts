import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AS UCSB · Committee on Committees",
    short_name: "CoC AS UCSB",
    description:
      "Open positions, the AS staffing roster, and the budget — public by default.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef0f2",
    theme_color: "#003660",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
