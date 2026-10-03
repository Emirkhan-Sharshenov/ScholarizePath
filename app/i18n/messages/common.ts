import { defineMessages } from '../define';
import { pluralEn, pluralRu } from '../format';

export default defineMessages({
    en: {
        tagline: 'Your Pathway to Global Education',
        close: 'Close',
        cancel: 'Cancel',
        save: 'Save',
        copyLink: 'Copy link',
        linkCopied: 'Link copied',
        favoritedBy: (n: number) => pluralEn(n, '# student favorited this', '# students favorited this'),
        saves: (n: number) => pluralEn(n, '# save', '# saves'),
    },
    ru: {
        tagline: 'Ваш путь к образованию за рубежом',
        close: 'Закрыть',
        cancel: 'Отмена',
        save: 'Сохранить',
        copyLink: 'Скопировать ссылку',
        linkCopied: 'Ссылка скопирована',
        favoritedBy: (n: number) =>
            pluralRu(n, '# студент добавил в избранное', '# студента добавили в избранное', '# студентов добавили в избранное'),
        saves: (n: number) => pluralRu(n, '# сохранение', '# сохранения', '# сохранений'),
    },
});
