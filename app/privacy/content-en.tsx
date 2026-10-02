import { CookieSettingsLink, Instagram, Item, Mail, PolicyFrame, Section, Strong, code, list } from './parts';

export const metaEn = {
    title: 'Privacy Policy · ScholarizePath',
    description: 'What data ScholarizePath collects, why, who processes it, and how to access, change or delete it.',
};

const SECTIONS = [
    { id: 'collect', title: 'What we collect' },
    { id: 'use', title: 'How we use it' },
    { id: 'cookies', title: 'Cookies and local storage' },
    { id: 'providers', title: 'Service providers' },
    { id: 'retention', title: 'How long we keep it' },
    { id: 'rights', title: 'Your choices and rights' },
    { id: 'security', title: 'Security' },
    { id: 'children', title: 'Children' },
    { id: 'changes', title: 'Changes and contact' },
];

export default function PrivacyEn() {
    return (
        <PolicyFrame
            eyebrow="Legal"
            title="Privacy Policy"
            updated="Last updated: October 1, 2026"
            tocLabel="On this page"
            sections={SECTIONS}
            intro={
                <>
                    ScholarizePath (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps students find universities and scholarships. This
                    page explains what personal data the site collects, why, who else processes it, and how you can see,
                    change or delete it. We don&rsquo;t sell your data and we don&rsquo;t show ads.
                </>
            }
        >
            <Section id="collect" title="1. What we collect">
                <ul className={list}>
                    <Item term="Account details">
                        Your first and last name, email address and password. The password is stored only as a one-way
                        hash, never in readable form.
                    </Item>
                    <Item term="Google sign-in">
                        If you sign in with Google, we receive your name, email address, Google account ID and profile
                        photo link. We don&rsquo;t get your Google password.
                    </Item>
                    <Item term="Student profile">
                        What you choose to fill in: age, nationality, GPA, SAT score, English test and score, preferred
                        field of study, preferred country and program level. We use it to match you with universities and
                        scholarships.
                    </Item>
                    <Item term="Your activity">
                        Saved universities and scholarships, entries in the application tracker (including your notes and
                        deadlines) and your deadline-reminder setting.
                    </Item>
                    <Item term="AI advisor messages">
                        The questions you ask the AI advisor and eligibility checker, together with the relevant parts of
                        your profile, are sent to our AI provider to generate an answer. We don&rsquo;t save the
                        conversation in our database.
                    </Item>
                    <Item term="Feedback">
                        Bug reports and suggestions you send us. They are stored without your name or email.
                    </Item>
                    <Item term="Technical data">
                        Your IP address is used briefly to limit repeated sign-in, sign-up and verification attempts. Our
                        hosting provider also keeps standard server logs.
                    </Item>
                    <Item term="Usage analytics">
                        With your consent (see section 3), Google Analytics records which pages are visited, approximate
                        location (country/city), device and browser type.
                    </Item>
                </ul>
            </Section>

            <Section id="use" title="2. How we use it">
                <ul className={list}>
                    <li>To create and secure your account and keep you signed in.</li>
                    <li>To show universities and scholarships that fit your profile, and to power the AI advisor.</li>
                    <li>To email you a verification code and, if you turn them on, application deadline reminders.</li>
                    <li>To prevent abuse, such as password guessing and spam.</li>
                    <li>To understand which features are useful and fix what isn&rsquo;t.</li>
                </ul>
                <p>
                    For visitors in the EU, UK and Switzerland, the legal bases are: performing our service for you
                    (account, profile, tracker), our legitimate interest in keeping the site secure, and your consent for
                    analytics.
                </p>
            </Section>

            <Section id="cookies" title="3. Cookies and local storage">
                <p>Cookies we need for the site to work:</p>
                <ul className={list}>
                    <li>
                        <code className={code}>token</code> keeps you signed in, for 7 days.
                    </li>
                    <li>
                        <code className={code}>register_session</code> holds a sign-up in progress while you verify your
                        email, for 15 minutes.
                    </li>
                    <li>
                        <code className={code}>google_oauth_state</code> protects Google sign-in against forgery, for 10
                        minutes.
                    </li>
                    <li>
                        <code className={code}>lang</code> remembers the interface language you picked, for a year.
                    </li>
                </ul>
                <p>
                    Analytics cookies: <code className={code}>_ga</code> and <code className={code}>_ga_*</code> from Google
                    Analytics. Visitors from the EU, EEA, UK and Switzerland get them only after clicking &ldquo;Accept&rdquo;.
                    Elsewhere they are on by default and you can turn them off. Declining removes them.
                </p>
                <p>
                    Your browser&rsquo;s local storage also keeps your cookie choice, your comparison lists and your
                    university list export. This data never leaves your device.
                </p>
                <p>
                    You can change your choice anytime: <CookieSettingsLink />.
                </p>
            </Section>

            <Section id="providers" title="4. Service providers">
                <p>
                    We use these companies to run the site. They process data only to provide their service to us. Some
                    are located outside your country, including in the United States.
                </p>
                <ul className={list}>
                    <Item term="Vercel">Hosting and server logs</Item>
                    <Item term="MongoDB">Database hosting for accounts, profiles and the tracker</Item>
                    <Item term="Upstash">Short-lived counters for rate limiting</Item>
                    <Item term="Groq">Runs the AI model behind the advisor and eligibility checker</Item>
                    <Item term="Resend">Sends verification and reminder emails</Item>
                    <Item term="Google">Google sign-in and Google Analytics</Item>
                </ul>
            </Section>

            <Section id="retention" title="5. How long we keep it">
                <ul className={list}>
                    <li>Account, profile and tracker data: until you delete your account.</li>
                    <li>Email verification codes: until they expire.</li>
                    <li>Rate-limit counters: seconds to one day.</li>
                    <li>Google Analytics data: up to 14 months, then deleted automatically.</li>
                    <li>Feedback: as long as it&rsquo;s useful for improving the site.</li>
                </ul>
            </Section>

            <Section id="rights" title="6. Your choices and rights">
                <ul className={list}>
                    <li>
                        <Strong>See and edit</Strong> your profile anytime on your profile page.
                    </li>
                    <li>
                        <Strong>Turn off reminders</Strong> in your profile&rsquo;s notification settings.
                    </li>
                    <li>
                        <Strong>Withdraw analytics consent</Strong> with <CookieSettingsLink />.
                    </li>
                    <li>
                        <Strong>Delete your account</Strong> anytime with &ldquo;Delete account&rdquo; on your profile page.
                        Your profile, saved items and tracker are removed immediately.
                    </li>
                    <li>
                        <Strong>Get a copy of your data</Strong> by emailing <Mail /> from the address you signed up with.
                        We reply within 30 days.
                    </li>
                </ul>
                <p>
                    Depending on where you live, you may also have the right to object to or restrict processing, and to
                    complain to your local data protection authority.
                </p>
            </Section>

            <Section id="security" title="7. Security">
                <p>
                    The site runs only over HTTPS. Passwords are hashed. The sign-in cookie can&rsquo;t be read by page
                    scripts and is sent only to this site. No system is perfectly secure, so please use a password you
                    don&rsquo;t use anywhere else.
                </p>
            </Section>

            <Section id="children" title="8. Children">
                <p>
                    ScholarizePath is meant for students preparing for university, typically 16 and older. If you believe a
                    child under 13 has created an account, email us and we&rsquo;ll delete it.
                </p>
            </Section>

            <Section id="changes" title="9. Changes and contact">
                <p>
                    If we change this policy, we&rsquo;ll update the date at the top of this page. For significant changes
                    we&rsquo;ll also let signed-in users know on the site.
                </p>
                <p>
                    Questions or requests: <Mail /> or Instagram <Instagram />.
                </p>
            </Section>
        </PolicyFrame>
    );
}
