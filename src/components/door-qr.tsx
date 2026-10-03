import { useEffect, useState } from "react";

export function DoorQr({ caption }: { caption: string }) {
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    const url = new URL("/", window.location.href).href;
    let live = true;
    void import("qrcode/lib/browser.js").then((mod) => {
      const qr = typeof mod.toString === "function" ? mod : mod.default;
      if (!qr) return "";
      return qr.toString(url, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#1c1915", light: "#00000000" },
      });
    })
      .then((svg) => {
        if (live) setMarkup(svg);
      })
      .catch(() => {
        if (live) setMarkup("");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <figure className="flex flex-col items-center gap-5">
      <div className="door-qr w-44 p-3.5 sm:w-48">
        {markup ? (
          <div role="img" aria-label={caption} dangerouslySetInnerHTML={{ __html: markup }} />
        ) : (
          <div className="aspect-square w-full" aria-hidden="true" />
        )}
      </div>
      <figcaption className="max-w-xs font-display text-xl tracking-wide text-ash text-balance">{caption}</figcaption>
    </figure>
  );
}
