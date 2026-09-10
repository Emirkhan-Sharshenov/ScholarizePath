import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface DeadlineReminderEmailProps {
    firstName: string;
    itemName: string;
    itemType: "scholarship" | "university";
    deadlineLabel: string;
    deadlineDate: string;
    daysBefore: number;
    link: string;
}

export default function DeadlineReminderEmail({
    firstName,
    itemName,
    itemType,
    deadlineLabel,
    deadlineDate,
    daysBefore,
    link,
}: DeadlineReminderEmailProps) {
    const itemTypeLabel = itemType === "scholarship" ? "стипендии" : "вуза";
    const dayWord = daysBefore === 1 ? "день" : "дней";

    return (
        <Html>
            <Head />
            <Preview>{`Дедлайн через ${daysBefore} ${dayWord}: ${itemName}`}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Скоро дедлайн, {firstName}!</Heading>
                    <Text style={text}>
                        До дедлайна «{deadlineLabel}» у {itemTypeLabel} <strong>{itemName}</strong>{" "}
                        осталось {daysBefore} {dayWord} — дата: {deadlineDate}.
                    </Text>
                    <Section style={buttonContainer}>
                        <Button style={button} href={link}>
                            Открыть страницу
                        </Button>
                    </Section>
                    <Text style={footerText}>
                        Вы получили это письмо, потому что добавили {itemName} в избранное на
                        ScholarizePath. Отключить напоминания можно в настройках профиля.
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

const buttonContainer = {
    margin: "20px 0",
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#2563eb",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
    textDecoration: "none",
    padding: "12px 24px",
};

const footerText = {
    color: "#9ca3af",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "20px 0 0",
};
