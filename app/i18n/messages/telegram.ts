import { defineMessages } from '../define';
import { pluralEn, pluralRu } from '../format';

// The Telegram bot's messages (plain text with <b> tags — sent as HTML) and
// the "Connect Telegram" block in the profile.

export default defineMessages({
    en: {
        // Bot
        linked: '✅ Done! Telegram is connected to ScholarizePath.\n\nI’ll remind you about the deadlines of your saved scholarships and universities 7 days and 1 day before.\n\nTo turn this off, send /stop.',
        welcome: 'Hi! I send deadline reminders from ScholarizePath.\n\nTo connect, open your profile on the site and press “Connect Telegram”.',
        linkExpired: 'This link has expired. Press “Connect Telegram” in your profile again.',
        stopped: 'Telegram reminders are off. You can connect again from your profile on the site.',
        reminderTitle: (days: number) => (days === 1 ? '⏰ Deadline tomorrow' : pluralEn(days, '⏰ Deadline in # day', '⏰ Deadline in # days')),
        open: 'Open on ScholarizePath',
        profile: 'Open my profile',
        // Profile
        title: 'Telegram',
        text: 'Get the same reminders in Telegram — harder to miss than an email.',
        connect: 'Connect Telegram',
        openTelegram: 'Open Telegram',
        waiting: 'Press “Start” in the bot — this page updates by itself.',
        connected: (username: string | null) => (username ? `Connected: @${username}` : 'Connected'),
        disconnect: 'Disconnect',
        unavailable: 'Telegram reminders aren’t available yet.',
        error: 'Something went wrong. Please try again.',
    },
    ru: {
        // Bot
        linked: '✅ Готово! Telegram подключён к ScholarizePath.\n\nНапомню о дедлайнах сохранённых стипендий и вузов за 7 дней и за 1 день.\n\nЧтобы отключить, отправьте /stop.',
        welcome: 'Привет! Я присылаю напоминания о дедлайнах из ScholarizePath.\n\nЧтобы подключиться, откройте профиль на сайте и нажмите «Подключить Telegram».',
        linkExpired: 'Ссылка устарела. Нажмите «Подключить Telegram» в профиле ещё раз.',
        stopped: 'Напоминания в Telegram отключены. Подключить снова можно в профиле на сайте.',
        reminderTitle: (days: number) => (days === 1 ? '⏰ Дедлайн завтра' : pluralRu(days, '⏰ Дедлайн через # день', '⏰ Дедлайн через # дня', '⏰ Дедлайн через # дней')),
        open: 'Открыть на ScholarizePath',
        profile: 'Открыть профиль',
        // Profile
        title: 'Telegram',
        text: 'Те же напоминания в Telegram — их сложнее пропустить, чем письмо.',
        connect: 'Подключить Telegram',
        openTelegram: 'Открыть Telegram',
        waiting: 'Нажмите «Старт» в боте — страница обновится сама.',
        connected: (username: string | null) => (username ? `Подключён: @${username}` : 'Подключён'),
        disconnect: 'Отключить',
        unavailable: 'Напоминания в Telegram пока недоступны.',
        error: 'Что-то пошло не так. Попробуйте ещё раз.',
    },
});
