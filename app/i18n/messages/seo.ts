import { defineMessages } from '../define';

// Titles and descriptions search engines show for the public catalogue pages.

export interface ScholarshipFacts {
    name: string;
    fullyFunded: boolean;
    country: string;
    level: string;
    deadline: string;
    amount: string;
}

export interface UniversityFacts {
    name: string;
    location: string;
    worldRank: number | null;
    tuition: string;
}

const sentence = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default defineMessages({
    en: {
        scholarshipsTitle: 'Scholarships for international students — deadlines and requirements | ScholarizePath',
        scholarshipsDescription:
            'Fully funded and partial scholarships to study abroad: exact deadlines, award amounts, eligibility and required documents. Free search by country, level and field.',
        universitiesTitle: 'Universities worldwide — tuition, rankings and admission requirements | ScholarizePath',
        universitiesDescription:
            'Compare 1,500+ universities around the world: tuition and living costs, QS rankings, acceptance rates, programs and admission requirements. Free.',
        scholarshipTitle: (name: string) => `${name}: deadline, amount and requirements | ScholarizePath`,
        scholarshipDescription: (s: ScholarshipFacts) =>
            sentence(
                `${s.fullyFunded ? 'Fully funded scholarship' : 'Scholarship'}${s.country ? ` in ${s.country}` : ''}${s.level ? ` for ${s.level}` : ''}.`,
                s.deadline && `Deadline: ${s.deadline}.`,
                s.amount && `Award: ${s.amount}.`,
                'Eligibility, required documents and how to apply.',
            ),
        universityTitle: (name: string) => `${name}: tuition, ranking and admission | ScholarizePath`,
        universityDescription: (u: UniversityFacts) =>
            sentence(
                `${u.name}${u.location ? `, ${u.location}` : ''}.`,
                u.worldRank !== null && `QS world rank #${u.worldRank}.`,
                u.tuition && `Tuition from ${u.tuition} a year.`,
                'Programs, admission requirements, deadlines and living costs.',
            ),
        notFound: 'Not found | ScholarizePath',
    },
    ru: {
        scholarshipsTitle: 'Стипендии для учёбы за рубежом — дедлайны и требования | ScholarizePath',
        scholarshipsDescription:
            'Полностью и частично оплачиваемые стипендии на учёбу за границей: точные дедлайны, суммы, требования и документы. Бесплатный поиск по стране, уровню и направлению.',
        universitiesTitle: 'Университеты мира — стоимость, рейтинги и требования к поступлению | ScholarizePath',
        universitiesDescription:
            'Сравните 1 500+ университетов мира: стоимость обучения и проживания, рейтинг QS, процент поступления, программы и требования. Бесплатно.',
        scholarshipTitle: (name: string) => `${name}: дедлайн, сумма и требования | ScholarizePath`,
        scholarshipDescription: (s: ScholarshipFacts) =>
            sentence(
                `${s.fullyFunded ? 'Полностью оплачиваемая стипендия' : 'Стипендия'}${s.country ? `, ${s.country}` : ''}${s.level ? `, уровень: ${s.level}` : ''}.`,
                // Russian dates end in "г." already.
                s.deadline && `Дедлайн: ${s.deadline.replace(/\.$/, '')}.`,
                s.amount && `Сумма: ${s.amount}.`,
                'Требования, документы и как подать заявку.',
            ),
        universityTitle: (name: string) => `${name}: стоимость, рейтинг и поступление | ScholarizePath`,
        universityDescription: (u: UniversityFacts) =>
            sentence(
                `${u.name}${u.location ? `, ${u.location}` : ''}.`,
                u.worldRank !== null && `Рейтинг QS: #${u.worldRank} в мире.`,
                u.tuition && `Обучение от ${u.tuition} в год.`,
                'Программы, требования к поступлению, дедлайны и стоимость жизни.',
            ),
        notFound: 'Не найдено | ScholarizePath',
    },
});
