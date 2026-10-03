import { defineMessages } from '../define';

type Feature = {
    badge: string;
    title: string;
    description: string;
    longDescription: string;
    highlights: string[];
    cta: string;
};

export default defineMessages({
    en: {
        meta: {
            title: 'ScholarizePath — Find Universities & Scholarships Worldwide',
            description:
                'Explore 1,500+ universities and 120+ scholarships worldwide. Get AI-powered university matching, admissions requirements, and personalized acceptance odds — all in one place.',
            ogDescription: 'Data-driven university matching and scholarship discovery for students planning to study abroad.',
            twitterDescription: 'Explore 1,500+ universities and 120+ scholarships worldwide with AI-powered matching.',
        },
        hero: {
            eyebrow: 'Universities · Scholarships · AI tools',
            titleStart: 'Find your best fit:',
            titleAccent: 'explore global opportunities',
            lead: 'Explore 1,500+ universities and 120+ scholarships, get AI help with your applications, and see your personalized admission odds — all in one place.',
            getStarted: 'Get started',
            exploreFeatures: 'Explore features',
            mostFavorited: 'Most favorited right now',
            university: 'University',
            scholarship: 'Scholarship',
        },
        stats: {
            label: 'Platform at a glance',
            universitiesValue: '1,500+',
            universities: 'Universities',
            scholarships: 'Scholarships',
            aiValue: 'AI',
            ai: 'Application assistant',
            oddsValue: 'Odds',
            odds: 'Personalized estimates',
        },
        featuresSection: {
            eyebrow: 'Platform features',
            title: 'Everything you need to apply abroad',
            lead: 'Data-driven insights, AI automation, and curated scholarship matching — tap any card to learn more.',
            explore: 'Explore feature',
        },
        features: [
            {
                badge: '1500+ Institutions',
                title: 'Global Universities',
                description: 'Explore over 1,500 top-ranked universities worldwide tailored to your academic profile.',
                longDescription:
                    'Browse a constantly growing catalog of universities from every major study destination — filter by country, ranking, tuition, and program to zero in on schools that actually fit your profile, not just the famous names.',
                highlights: [
                    'Detailed profiles: rankings, tuition, acceptance rates, and campus life',
                    'Filter by country, field of study, budget, and academic requirements',
                    'Save favorites and compare institutions side by side',
                ],
                cta: 'Browse universities',
            },
            {
                badge: '120+ Grants',
                title: 'Scholarship Finder',
                description: 'Discover fully funded and partial scholarships matching your target field and criteria.',
                longDescription:
                    'Search a curated database of scholarships and grants — from full-ride awards to field-specific grants — and instantly see which ones you qualify for based on your nationality, GPA, and program of interest.',
                highlights: [
                    'Fully funded and partial scholarships from 120+ programs',
                    'Eligibility criteria and deadlines at a glance',
                    'Matches refined by your academic and financial profile',
                ],
                cta: 'Find scholarships',
            },
            {
                badge: 'AI Powered',
                title: 'Smart Assistant',
                description: 'Leverage interactive AI tools to streamline, draft, and automate your entire application process.',
                longDescription:
                    'Chat with an AI assistant trained to help with every stage of studying abroad — from shortlisting universities to drafting essays — and get personalized recommendations based on the details you share.',
                highlights: [
                    'Conversational AI that answers questions about universities and scholarships',
                    'Personalized university and scholarship recommendations',
                    'Drafting help for essays and application documents',
                ],
                cta: 'Try the assistant',
            },
            {
                badge: 'Algorithmic',
                title: 'List Generator',
                description: 'Generate highly curated university lists matched precisely to your budget and preferences.',
                longDescription:
                    'Turn your preferences — budget, location, field of study, and academic scores — into a ready-to-use, exportable list of universities worth applying to, so you spend less time searching and more time applying.',
                highlights: [
                    'Curated shortlist based on your budget and preferences',
                    'Export your list as a document to share or keep for reference',
                    'Balanced mix of reach, match, and safety schools',
                ],
                cta: 'Generate a list',
            },
            {
                badge: 'Requirements',
                title: 'Admissions Details',
                description: 'Access complete admissions criteria, required document checklists, and key deadlines.',
                longDescription:
                    "Every university page breaks down exactly what's required to apply — test scores, required documents, application deadlines — so nothing catches you off guard late in the process.",
                highlights: [
                    'Required test scores (SAT, IELTS/TOEFL, and more) per university',
                    'Document checklists for each application',
                    'Key deadlines so you never miss a submission window',
                ],
                cta: 'View requirements',
            },
            {
                badge: 'Analytics',
                title: 'Personalized Odds',
                description: 'Evaluate your target programs with an algorithmic estimate of your acceptance chances.',
                longDescription:
                    "Based on your GPA, test scores, and profile compared against each university's historical admissions data, get an estimated acceptance chance for every program you're considering — so you can build a balanced list with confidence.",
                highlights: [
                    'Acceptance-chance estimates tailored to your academic profile',
                    'Benchmarks against real historical admissions data',
                    'Helps you balance reach, match, and safety schools',
                ],
                cta: 'Check your odds',
            },
        ] as Feature[],
        rankingsHeading: 'Most favorited universities and scholarships',
        cta: {
            title: 'Your path to studying abroad starts here',
            lead: 'Save universities and scholarships, build your list, and track every application in one place.',
            create: 'Create your account',
            signIn: 'Sign in',
        },
        teaser: {
            eyebrow: 'Trending now',
            title: 'Most Favorited Right Now',
            lead: 'Universities and scholarships students are saving the most',
            seeAll: 'See full ranking →',
            topUniversities: 'Top Universities',
            topScholarships: 'Top Scholarships',
            noFavorites: 'No favorites yet.',
            empty: 'No favorites yet — be the first to add a scholarship or university to your favorites and put it on the map.',
        },
        top: {
            metaTitle: 'Top Universities & Scholarships | ScholarizePath',
            metaDescription:
                'See which universities and scholarships students are favoriting the most on ScholarizePath, ranked by real student activity.',
            ogDescription: 'Ranked by real student favorites — see the most popular universities and scholarships on ScholarizePath.',
            listName: 'Top Universities on ScholarizePath',
            eyebrow: 'Community picks',
            title: 'Most saved universities & scholarships',
            lead: 'Ranked by how many students saved them on ScholarizePath · updated hourly',
            rankingType: 'Ranking type',
            universities: 'Universities',
            scholarships: 'Scholarships',
            notEnough: 'Not enough activity yet',
            notEnoughUniversities: 'Rankings appear once students start saving universities.',
            notEnoughScholarships: 'Rankings appear once students start saving scholarships.',
            viewDetails: 'View details',
            rank: 'Rank',
            university: 'University',
            scholarship: 'Scholarship',
            saves: 'Saves',
            ctaTitle: 'Save your own shortlist',
            ctaLead: 'Create a free account to save universities and scholarships, compare them side by side and track your applications.',
            getStarted: 'Get started',
            exploreUniversities: 'Explore universities',
        },
    },
    ru: {
        meta: {
            title: 'ScholarizePath — университеты и стипендии по всему миру',
            description:
                'Более 1 500 университетов и 120 стипендий по всему миру. Подбор вузов с помощью ИИ, требования к поступлению и персональная оценка шансов — всё в одном месте.',
            ogDescription: 'Подбор университетов на основе данных и поиск стипендий для тех, кто планирует учиться за рубежом.',
            twitterDescription: 'Более 1 500 университетов и 120 стипендий по всему миру с подбором на основе ИИ.',
        },
        hero: {
            eyebrow: 'Университеты · Стипендии · ИИ-инструменты',
            titleStart: 'Найдите свой вуз:',
            titleAccent: 'возможности по всему миру',
            lead: 'Более 1 500 университетов и 120 стипендий, помощь ИИ с заявками и персональная оценка шансов на поступление — всё в одном месте.',
            getStarted: 'Начать',
            exploreFeatures: 'Возможности',
            mostFavorited: 'Чаще всего сохраняют сейчас',
            university: 'Университет',
            scholarship: 'Стипендия',
        },
        stats: {
            label: 'Платформа в цифрах',
            universitiesValue: '1 500+',
            universities: 'Университетов',
            scholarships: 'Стипендий',
            aiValue: 'ИИ',
            ai: 'Помощник с заявками',
            oddsValue: 'Шансы',
            odds: 'Персональная оценка',
        },
        featuresSection: {
            eyebrow: 'Возможности платформы',
            title: 'Всё, что нужно для поступления за рубеж',
            lead: 'Аналитика на основе данных, помощь ИИ и подбор стипендий — нажмите на карточку, чтобы узнать больше.',
            explore: 'Подробнее',
        },
        features: [
            {
                badge: '1500+ вузов',
                title: 'Университеты мира',
                description: 'Более 1 500 ведущих университетов мира с подбором под ваш академический профиль.',
                longDescription:
                    'Постоянно растущий каталог университетов во всех популярных странах для учёбы. Фильтруйте по стране, рейтингу, стоимости и программе, чтобы найти вузы, которые подходят именно вам, а не только самые известные.',
                highlights: [
                    'Подробные профили: рейтинги, стоимость, процент поступления и студенческая жизнь',
                    'Фильтры по стране, направлению, бюджету и требованиям',
                    'Сохраняйте в избранное и сравнивайте вузы между собой',
                ],
                cta: 'Смотреть университеты',
            },
            {
                badge: '120+ грантов',
                title: 'Поиск стипендий',
                description: 'Полные и частичные стипендии, подходящие под ваше направление и критерии.',
                longDescription:
                    'Отобранная база стипендий и грантов — от полного покрытия до грантов для конкретных специальностей. Сразу видно, на какие из них вы подходите по гражданству, среднему баллу и программе.',
                highlights: [
                    'Полные и частичные стипендии более чем 120 программ',
                    'Критерии отбора и дедлайны в одном месте',
                    'Подбор с учётом вашего академического и финансового профиля',
                ],
                cta: 'Найти стипендии',
            },
            {
                badge: 'На основе ИИ',
                title: 'Умный помощник',
                description: 'Интерактивные ИИ-инструменты, которые упрощают и ускоряют подготовку заявок.',
                longDescription:
                    'Общайтесь с ИИ-помощником на любом этапе поступления за рубеж — от выбора вузов до черновиков эссе — и получайте рекомендации на основе ваших данных.',
                highlights: [
                    'ИИ отвечает на вопросы об университетах и стипендиях',
                    'Персональные рекомендации вузов и стипендий',
                    'Помощь с эссе и документами для заявки',
                ],
                cta: 'Попробовать помощника',
            },
            {
                badge: 'Алгоритм',
                title: 'Генератор списка',
                description: 'Готовый список университетов, подобранный под ваш бюджет и предпочтения.',
                longDescription:
                    'Превратите ваши предпочтения — бюджет, страну, направление и баллы — в готовый список университетов для подачи, который можно скачать. Меньше времени на поиск, больше на заявки.',
                highlights: [
                    'Шорт-лист с учётом бюджета и предпочтений',
                    'Экспорт списка в документ, чтобы поделиться или сохранить',
                    'Сбалансированный выбор: амбициозные, подходящие и надёжные вузы',
                ],
                cta: 'Составить список',
            },
            {
                badge: 'Требования',
                title: 'Условия поступления',
                description: 'Полные требования к поступлению, списки документов и ключевые дедлайны.',
                longDescription:
                    'На странице каждого университета расписано, что нужно для подачи: баллы экзаменов, документы, сроки. Ничто не застанет вас врасплох в последний момент.',
                highlights: [
                    'Требуемые баллы (SAT, IELTS/TOEFL и другие) для каждого вуза',
                    'Список документов для каждой заявки',
                    'Ключевые дедлайны, чтобы ничего не пропустить',
                ],
                cta: 'Смотреть требования',
            },
            {
                badge: 'Аналитика',
                title: 'Ваши шансы',
                description: 'Алгоритмическая оценка ваших шансов на поступление в выбранные программы.',
                longDescription:
                    'Мы сравниваем ваш средний балл, результаты экзаменов и профиль с историческими данными о поступлении в каждый вуз и показываем примерные шансы, чтобы вы уверенно составили сбалансированный список.',
                highlights: [
                    'Оценка шансов с учётом вашего академического профиля',
                    'Сравнение с реальными данными о поступлении прошлых лет',
                    'Помогает сбалансировать амбициозные, подходящие и надёжные варианты',
                ],
                cta: 'Узнать шансы',
            },
        ],
        rankingsHeading: 'Самые популярные университеты и стипендии',
        cta: {
            title: 'Ваш путь к учёбе за рубежом начинается здесь',
            lead: 'Сохраняйте университеты и стипендии, составляйте список и отслеживайте все заявки в одном месте.',
            create: 'Создать аккаунт',
            signIn: 'Войти',
        },
        teaser: {
            eyebrow: 'Сейчас в тренде',
            title: 'Чаще всего сохраняют сейчас',
            lead: 'Университеты и стипендии, которые студенты сохраняют чаще всего',
            seeAll: 'Весь рейтинг →',
            topUniversities: 'Топ университетов',
            topScholarships: 'Топ стипендий',
            noFavorites: 'Пока никто ничего не сохранил.',
            empty: 'Пока никто ничего не сохранил — станьте первым, кто добавит стипендию или университет в избранное.',
        },
        top: {
            metaTitle: 'Топ университетов и стипендий | ScholarizePath',
            metaDescription:
                'Какие университеты и стипендии студенты чаще всего добавляют в избранное на ScholarizePath — рейтинг по реальной активности.',
            ogDescription: 'Рейтинг по реальному избранному студентов — самые популярные университеты и стипендии на ScholarizePath.',
            listName: 'Топ университетов на ScholarizePath',
            eyebrow: 'Выбор сообщества',
            title: 'Самые сохраняемые университеты и стипендии',
            lead: 'Рейтинг по числу студентов, сохранивших их на ScholarizePath · обновляется каждый час',
            rankingType: 'Тип рейтинга',
            universities: 'Университеты',
            scholarships: 'Стипендии',
            notEnough: 'Пока мало данных',
            notEnoughUniversities: 'Рейтинг появится, когда студенты начнут сохранять университеты.',
            notEnoughScholarships: 'Рейтинг появится, когда студенты начнут сохранять стипендии.',
            viewDetails: 'Подробнее',
            rank: 'Место',
            university: 'Университет',
            scholarship: 'Стипендия',
            saves: 'Сохранения',
            ctaTitle: 'Соберите свой шорт-лист',
            ctaLead: 'Создайте бесплатный аккаунт, чтобы сохранять университеты и стипендии, сравнивать их и отслеживать заявки.',
            getStarted: 'Начать',
            exploreUniversities: 'Смотреть университеты',
        },
    },
});
