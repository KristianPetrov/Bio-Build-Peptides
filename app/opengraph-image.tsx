import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bio Build Peptides — Build Better Biology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [font, background] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Cinzel-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og-bg.jpg"), "base64"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#050505" }}>
        <img src={`data:image/jpeg;base64,${background}`} width={1200} height={630} style={{ position: "absolute", inset: 0 }} alt="" />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.9) 34%, rgba(5,5,5,0.1) 62%, transparent 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 720 }}>
          <div style={{ fontFamily: "Cinzel", fontSize: 112, lineHeight: 1, letterSpacing: 4, color: "#E9CB8C", display: "flex" }}>
            BIO BUILD
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 28, gap: 18 }}>
            <div style={{ height: 1, width: 70, background: "#C9A15B" }} />
            <div style={{ fontSize: 22, letterSpacing: 9, color: "#F3D9A0" }}>BUILD BETTER BIOLOGY</div>
            <div style={{ height: 1, width: 70, background: "#C9A15B" }} />
          </div>
          <div style={{ marginTop: 44, fontSize: 24, color: "#A99D88", lineHeight: 1.5, display: "flex" }}>
            Research peptides & laboratory supplies · For research use only
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Cinzel", data: font, weight: 600, style: "normal" }] },
  );
}
