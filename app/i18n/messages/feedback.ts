import { defineMessages } from '../define';

type Field = { label: string; placeholder: string };
type Form = { title: string; subtitle: string; submit: string; sent: string; fields: Record<string, Field> };

export default defineMessages({
    en: {
        forms: {
            bug: {
                title: 'Report a bug',
                subtitle: 'Errors, wrong data or broken links.',
                submit: 'Send bug report',
                sent: 'Thanks! Your bug report was sent.',
                fields: {
                    title: { label: 'Title', placeholder: 'Briefly describe the issue' },
                    description: { label: 'What went wrong?', placeholder: 'What happened, and what did you expect?' },
                    steps: { label: 'Steps to reproduce', placeholder: '1. Go to page…\n2. Click on…' },
                },
            },
            suggestion: {
                title: 'Suggest a feature',
                subtitle: 'Tools, data or improvements that would help you.',
                submit: 'Send suggestion',
                sent: 'Thanks! Your suggestion was sent.',
                fields: {
                    title: { label: 'Title', placeholder: 'Briefly describe your idea' },
                    suggestion: { label: 'Your idea', placeholder: 'What would you like to see?' },
                    benefit: { label: 'Why would it help?', placeholder: 'Who would it help, and how?' },
                },
            },
        } as Record<'bug' | 'suggestion', Form>,
        fillIn: (label: string) => `Please fill in “${label}”`,
        sendFailed: "Couldn't send — please try again.",
        weRead: 'We read every message.',
        sendAnother: 'Send another',
        sending: 'Sending…',
        title: 'Feedback',
        lead: 'Found a bug or have an idea? We read every message.',
        type: 'Feedback type',
        bugTab: 'Bug report',
        suggestionTab: 'Suggestion',
    },
    ru: {
        forms: {
            bug: {
                title: 'Сообщить об ошибке',
                subtitle: 'Ошибки, неверные данные или битые ссылки.',
                submit: 'Отправить',
                sent: 'Спасибо! Сообщение об ошибке отправлено.',
                fields: {
                    title: { label: 'Заголовок', placeholder: 'Кратко опишите проблему' },
                    description: { label: 'Что пошло не так?', placeholder: 'Что произошло и что вы ожидали?' },
                    steps: { label: 'Как воспроизвести', placeholder: '1. Откройте страницу…\n2. Нажмите на…' },
                },
            },
            suggestion: {
                title: 'Предложить идею',
                subtitle: 'Инструменты, данные или улучшения, которые вам помогут.',
                submit: 'Отправить идею',
                sent: 'Спасибо! Ваша идея отправлена.',
                fields: {
                    title: { label: 'Заголовок', placeholder: 'Кратко опишите идею' },
                    suggestion: { label: 'Ваша идея', placeholder: 'Что бы вы хотели видеть?' },
                    benefit: { label: 'Чем это поможет?', placeholder: 'Кому и как это поможет?' },
                },
            },
        },
        fillIn: (label: string) => `Заполните поле «${label}»`,
        sendFailed: 'Не удалось отправить — попробуйте ещё раз.',
        weRead: 'Мы читаем каждое сообщение.',
        sendAnother: 'Отправить ещё',
        sending: 'Отправляем…',
        title: 'Обратная связь',
        lead: 'Нашли ошибку или есть идея? Мы читаем каждое сообщение.',
        type: 'Тип обращения',
        bugTab: 'Ошибка',
        suggestionTab: 'Идея',
    },
});
