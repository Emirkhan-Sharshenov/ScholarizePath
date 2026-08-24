import React from "react"
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components"

interface VerificationEmailProps {
    firstName?: string
    verifyUrl?: string
}

export const VerificationEmail = ({
    firstName = "Student",
    verifyUrl = "https://scholarizepath.com/verify-email/your-unique-token-here",
}: VerificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Verify Your Email Address - ScholarizePath</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header Placeholder Logo */}
                    <Section style={headerLogoSection}>
                        <div style={logoPlaceholder}>
                            <span style={logoIcon}>🎓</span>
                            <span style={logoText}>ScholarizePath</span>
                        </div>
                    </Section>

                    {/* Main White Card */}
                    <Section style={card}>
                        <Heading style={heading}>
                            Verify Your Email Address -<br />
                            ScholarizePath
                        </Heading>

                        <Text style={text}>Hi {firstName},</Text>

                        <Text style={text}>
                            Thanks for signing up for ScholarizePath! Please verify your email
                            address to complete your account setup and access your Admin
                            Dashboard.
                        </Text>

                        <Text style={text}>This link will expire in 24 hours.</Text>

                        {/* Button */}
                        <Section style={buttonContainer}>
                            <Button style={button} href={verifyUrl}>
                                Verify Email Address
                            </Button>
                        </Section>

                        <Text style={text}>
                            If you didn’t sign up for ScholarizePath, you can safely ignore
                            this email.
                        </Text>

                        <Text style={fallbackText}>
                            You can also copy and paste this link into your browser:
                            <br />
                            <Link href={verifyUrl} style={link}>
                                [{verifyUrl}]
                            </Link>
                        </Text>
                    </Section>

                    {/* Footer Placeholder Logo & Links */}
                    <Section style={footer}>
                        <div style={{ ...logoPlaceholder, marginBottom: "12px" }}>
                            <span style={{ ...logoIcon, fontSize: "18px" }}>🎓</span>
                            <span style={{ ...logoText, fontSize: "16px" }}>ScholarizePath</span>
                        </div>
                        <Text style={footerText}>
                            © 2026 ScholarizePath. All rights reserved.
                        </Text>
                        <Text style={footerLinks}>
                            <Link href="#" style={footerLink}>
                                Privacy Policy
                            </Link>
                            {"   "}
                            <Link href="#" style={footerLink}>
                                Contact Support
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

export default VerificationEmail

// --- СТИЛИ ---

const main: React.CSSProperties = {
    backgroundColor: "#f4f6f8",
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: "40px 0",
}

const container: React.CSSProperties = {
    margin: "0 auto",
    maxWidth: "520px",
    padding: "0 16px",
}

const headerLogoSection: React.CSSProperties = {
    textAlign: "center" as const,
    paddingBottom: "24px",
}

// Плейсхолдер для логотипа
const logoPlaceholder: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
}

const logoIcon: React.CSSProperties = {
    fontSize: "26px",
}

const logoText: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1d70b8",
    letterSpacing: "-0.5px",
}

const card: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "40px 32px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
}

const heading: React.CSSProperties = {
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: "700",
    textAlign: "center" as const,
    margin: "0 0 28px 0",
    lineHeight: "1.3",
}

const text: React.CSSProperties = {
    color: "#1e293b",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
}

const buttonContainer: React.CSSProperties = {
    textAlign: "center" as const,
    margin: "28px 0",
}

const button: React.CSSProperties = {
    backgroundColor: "#1d70b8",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 28px",
}

const fallbackText: React.CSSProperties = {
    color: "#334155",
    fontSize: "13px",
    lineHeight: "1.5",
    marginTop: "20px",
}

const link: React.CSSProperties = {
    color: "#1d70b8",
    wordBreak: "break-all" as const,
    textDecoration: "underline",
}

const footer: React.CSSProperties = {
    textAlign: "center" as const,
    marginTop: "32px",
}

const footerText: React.CSSProperties = {
    color: "#64748b",
    fontSize: "13px",
    margin: "0 0 8px 0",
}

const footerLinks: React.CSSProperties = {
    margin: "0",
}

const footerLink: React.CSSProperties = {
    color: "#1d70b8",
    fontSize: "13px",
    textDecoration: "underline",
}