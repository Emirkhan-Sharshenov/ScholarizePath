import { defineMessages } from '../define';

// API routes answer in English; the UI shows their `message` to users in a
// few places. This maps those messages to Russian. Unknown messages (and all
// of them in English) pass through unchanged — see apiMessage() in format.ts.
const ru: Record<string, string> = {
    'All fields are required': 'Заполните все поля',
    'User already exists': 'Пользователь с такой почтой уже существует',
    'User already registered': 'Пользователь уже зарегистрирован',
    'Failed to send verification email': 'Не удалось отправить письмо с кодом',
    'Verification code sent! Please check your email.': 'Код отправлен! Проверьте почту.',
    'Registration session expired. Please register again.': 'Сессия регистрации истекла. Зарегистрируйтесь заново.',
    'Verification code expired or invalid session.': 'Код истёк или сессия недействительна.',
    'Verification code is required': 'Введите код подтверждения',
    'Invalid verification code': 'Неверный код подтверждения',
    'Email verified and account created successfully!': 'Почта подтверждена, аккаунт создан!',
    'Email and password are required': 'Введите почту и пароль',
    'Invalid email or password': 'Неверная почта или пароль',
    'Too many requests. Try again later.': 'Слишком много попыток. Попробуйте позже.',
    'Too many requests — please slow down and try again in a minute.': 'Слишком много запросов — подождите минуту и попробуйте снова.',
    'Too many messages — please slow down and try again in a minute.': 'Слишком много сообщений — подождите минуту и попробуйте снова.',
    'Too many attempts. Please try again in 15 minutes.': 'Слишком много попыток. Попробуйте через 15 минут.',
    "You've reached your daily limit of AI messages. Please come back tomorrow.": 'Вы исчерпали дневной лимит сообщений ИИ. Возвращайтесь завтра.',
    "You've reached your daily limit of AI eligibility checks. Please come back tomorrow.": 'Вы исчерпали дневной лимит проверок ИИ. Возвращайтесь завтра.',
    "Couldn't generate an explanation right now. Please try again.": 'Не удалось получить объяснение. Попробуйте ещё раз.',
    "You're the only admin. Make someone else an admin first.": 'Вы единственный администратор. Сначала назначьте другого администратора.',
    'Incorrect password.': 'Неверный пароль.',
    "That email doesn't match your account.": 'Эта почта не совпадает с почтой аккаунта.',
    'Failed to delete account': 'Не удалось удалить аккаунт',
    'This item is already being tracked': 'Этот вариант уже есть в трекере',
    'Failed to track application': 'Не удалось добавить заявку',
    'Failed to update tracked application': 'Не удалось обновить заявку',
    'Failed to remove tracked application': 'Не удалось удалить заявку',
    'Failed to submit feedback': 'Не удалось отправить отзыв',
    'Title is required': 'Укажите заголовок',
    'Bug description is required': 'Опишите ошибку',
    'Steps to reproduce are required': 'Опишите, как воспроизвести ошибку',
    'Suggestion is required': 'Опишите предложение',
    'Benefit is required': 'Опишите, чем это поможет',
    'Failed to update user profile': 'Не удалось обновить профиль',
    'Failed to complete profile setup': 'Не удалось сохранить профиль',
    'Profile setup has already been completed': 'Профиль уже заполнен',
    'Something went wrong. Please try again.': 'Что-то пошло не так. Попробуйте ещё раз.',
    'Internal Server Error': 'Ошибка сервера',
    'Internal server error': 'Ошибка сервера',
    Unauthorized: 'Нужно войти в аккаунт',
};

export default defineMessages<Record<string, string>>({ en: {}, ru });
