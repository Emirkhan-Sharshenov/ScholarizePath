import { ImageResponse } from "next/og";

export const alt = "ScholarizePath — Find Universities & Scholarships Worldwide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #0058bd 0%, #000139 100%)",
                    color: "white",
                    fontFamily: "sans-serif",
                    padding: "80px",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85, display: "flex" }}>
                    ScholarizePath
                </div>
                <div
                    style={{
                        fontSize: 68,
                        fontWeight: 800,
                        lineHeight: 1.15,
                        marginTop: 24,
                        display: "flex",
                    }}
                >
                    Find Your Best Fit
                </div>
                <div style={{ fontSize: 30, opacity: 0.85, marginTop: 28, display: "flex" }}>
                    1,500+ universities · 120+ scholarships · AI-powered matching
                </div>
            </div>
        ),
        { ...size }
    );
}
