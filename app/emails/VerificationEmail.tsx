import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
    firstName: string;
    code: string;
}

export default function VerificationEmail({
    firstName,
    code,
}: VerificationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Ваш код подтверждения для ScholarizePath</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Добро пожаловать, {firstName}!</Heading>
                    <Text style={text}>
                        Спасибо за регистрацию в ScholarizePath. Для подтверждения электронной почты введите следующий 6-значный код. Он действителен в течение 15 минут:
                    </Text>
                    <Section style={codeContainer}>
                        <Text style={codeText}>{code}</Text>
                    </Section>
                    <Text style={footerText}>
                        Если вы не создавали аккаунт на ScholarizePath, просто проигнорируйте это письмо.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "30px 30px 40px",
    borderRadius: "8px",
    maxWidth: "600px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const h1 = {
    color: "#1f2937",
    fontSize: "22px",
    fontWeight: "bold",
    margin: "0 0 20px",
};

const text = {
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 20px",
};

const codeContainer = {
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    margin: "20px 0",
    padding: "16px",
    textAlign: "center" as const,
};

const codeText = {
    color: "#111827",
    fontSize: "36px",
    fontWeight: "bold",
    letterSpacing: "8px",
    margin: "0",
};

const footerText = {
    color: "#9ca3af",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "20px 0 0",
};