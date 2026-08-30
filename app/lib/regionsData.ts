export interface RegionConfig {
    id: string;
    label: string;
    color: string;      
    hexColor: string;  
    countries: string[];
}

export const REGIONS_DATA: RegionConfig[] = [
    {
        id: 'north-america',
        label: 'North America',
        color: 'bg-blue-600',
        hexColor: '#2563EB',
        countries: ['Canada', 'United States of America', 'United States', 'Mexico'],
    },
    {
        id: 'europe',
        label: 'Europe',
        color: 'bg-indigo-500',
        hexColor: '#6366F1',
        countries: [
            'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Czechia',
            'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary',
            'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Malta', 'Netherlands', 'Norway',
            'Poland', 'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain',
            'Sweden', 'Switzerland', 'Turkey', 'United Kingdom', 'Ukraine'
        ],
    },
    {
        id: 'asia',
        label: 'Asia',
        color: 'bg-sky-400',
        hexColor: '#38BDF8',
        countries: [
            'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Brunei', 'Cambodia', 'China',
            'Hong Kong', 'India', 'Indonesia', 'Iran', 'Israel', 'Japan', 'Jordan', 'Kazakhstan',
            'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Mongolia', 'Nepal', 'Oman',
            'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Saudi Arabia', 'Singapore',
            'South Korea', 'Sri Lanka', 'Taiwan', 'Thailand', 'United Arab Emirates', 'Uzbekistan', 'Vietnam'
        ],
    },
    {
        id: 'australia',
        label: 'Australia',
        color: 'bg-emerald-400',
        hexColor: '#34D399',
        countries: ['Australia', 'Fiji', 'New Zealand'],
    },
    {
        id: 'south-america',
        label: 'South America',
        color: 'bg-amber-400',
        hexColor: '#FBBF24',
        countries: ['Argentina', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Ecuador', 'Peru', 'Uruguay'],
    },
    {
        id: 'africa',
        label: 'Africa',
        color: 'bg-pink-400',
        hexColor: '#F472B6',
        countries: ['Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Morocco', 'Nigeria', 'Senegal', 'South Africa', 'Tanzania', 'Tunisia', 'Uganda'],
    },
];