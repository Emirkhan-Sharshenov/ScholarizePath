// Cookie consent for Google Analytics (Consent Mode v2).
//
// Visitors from the EEA, UK and Switzerland start with analytics denied
// until they accept; everyone else starts granted and can opt out. Ads
// storage is always denied: the site shows no ads. The choice lives in
// localStorage and is re-applied before GA loads on every page view.

export type ConsentChoice = 'granted' | 'denied';

export const CONSENT_STORAGE_KEY = 'sp-cookie-consent';
const CHANGE_EVENT = 'sp-consent-change';
const OPEN_EVENT = 'sp-open-cookie-settings';

const CONSENT_REQUIRED_REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
    'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    'IS', 'LI', 'NO', 'GB', 'CH',
];

/** Inline script for the root layout; must run before the GA config call. */
export const consentDefaultsScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var noAds = {ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
gtag('consent','default',Object.assign({analytics_storage:'denied',region:${JSON.stringify(CONSENT_REQUIRED_REGIONS)},wait_for_update:500},noAds));
gtag('consent','default',Object.assign({analytics_storage:'granted'},noAds));
try {
  var c = localStorage.getItem('${CONSENT_STORAGE_KEY}');
  if (c === 'granted' || c === 'denied') gtag('consent','update',{analytics_storage:c});
} catch (e) {}
`;

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Fallback for browsers that block localStorage, so the banner still
// closes for the rest of the visit.
let memoryChoice: ConsentChoice | null = null;

export function readConsent(): ConsentChoice | null {
    try {
        const value = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (value === 'granted' || value === 'denied') return value;
    } catch {}
    return memoryChoice;
}

export function saveConsent(choice: ConsentChoice) {
    memoryChoice = choice;
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {}
    window.gtag?.('consent', 'update', { analytics_storage: choice });
    if (choice === 'denied') clearAnalyticsCookies();
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void) {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener('storage', onChange);
    };
}

export function openCookieSettings() {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(handler: () => void) {
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
}

// GA sets _ga / _ga_<id> on the top-level domain; remove them on opt-out.
function clearAnalyticsCookies() {
    const host = location.hostname;
    const domains = ['', host, `.${host.split('.').slice(-2).join('.')}`];
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!name.startsWith('_ga')) continue;
        for (const domain of domains) {
            document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
        }
    }
}
