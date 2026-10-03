import type { Locale } from '../config';
import aibot from './aibot';
import api from './api';
import auth from './auth';
import calculator from './calculator';
import common from './common';
import compare from './compare';
import dashboard from './dashboard';
import favourites from './favourites';
import feedback from './feedback';
import home from './home';
import nav from './nav';
import profile from './profile';
import scholarships from './scholarships';
import seo from './seo';
import site from './site';
import student from './student';
import tracker from './tracker';
import ui from './ui';
import unilist from './unilist';
import universities from './universities';

// Every namespace, in both languages. Add new namespaces here.
const namespaces = {
    aibot,
    api,
    auth,
    calculator,
    common,
    compare,
    dashboard,
    favourites,
    feedback,
    home,
    nav,
    profile,
    scholarships,
    seo,
    site,
    student,
    tracker,
    ui,
    unilist,
    universities,
};

type Namespaces = typeof namespaces;
export type Messages = { [K in keyof Namespaces]: Namespaces[K]['en'] };

const cache: Partial<Record<Locale, Messages>> = {};

export function getMessages(locale: Locale): Messages {
    return (cache[locale] ??= Object.fromEntries(
        Object.entries(namespaces).map(([name, ns]) => [name, ns[locale]]),
    ) as Messages);
}
