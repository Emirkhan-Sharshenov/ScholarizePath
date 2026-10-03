'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import BrandLogo from '@/components/brand/BrandLogo'
import LanguageSwitcher from '@/i18n/LanguageSwitcher'
import { useI18n } from '@/i18n/I18nProvider'
import { apiMessage } from '@/i18n/format'
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Bot,
    ClipboardList,
    Eye,
    EyeOff,
    GraduationCap,
    Heart,
    Lock,
    Mail,
    MailCheck,
    TrendingUp,
    User,
    type LucideIcon,
} from 'lucide-react'

// Icons for the brand panel's three points on the left (desktop only), per
// mode; the copy comes from the `auth.panel` messages, in the same order.
const PANEL_ICONS: Record<'login' | 'register', LucideIcon[]> = {
    login: [Heart, ClipboardList, Bot],
    register: [GraduationCap, Award, TrendingUp],
}

const inputClass =
    'h-12 w-full rounded-[10px] border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-ink placeholder:text-slate-400 shadow-sm transition-colors hover:border-slate-300 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10'

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v2.99h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.92l-3.88-2.99c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.09A12 12 0 0 0 12 24Z" />
            <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.09Z" />
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z" />
        </svg>
    )
}

function GoogleButton({ label }: { label: string }) {
    return (
        <a
            href="/api/auth/google"
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-slate-200 bg-white text-[15px] font-semibold text-ink shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
            <GoogleIcon />
            {label}
        </a>
    )
}

function OrDivider() {
    const { t } = useI18n()
    return (
        <div className="flex w-full items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {t.auth.orWithEmail}
            <span className="h-px flex-1 bg-slate-200" />
        </div>
    )
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
        </div>
    )
}

function Field({
    id,
    label,
    icon: Icon,
    children,
}: {
    id: string
    label: string
    icon: LucideIcon
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-ink">
                {label}
            </label>
            <div className="relative">
                <Icon aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                {children}
            </div>
        </div>
    )
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [visible, setVisible] = useState(false)
    const { t } = useI18n()

    return (
        <>
            <input {...props} type={visible ? 'text' : 'password'} className={`${inputClass} pr-12`} />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
                aria-pressed={visible}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
                {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
        </>
    )
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,88,189,0.25)] transition-all hover:bg-[#004a9f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? (
                <>
                    <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {loadingLabel}
                </>
            ) : (
                <>
                    {label}
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
            )}
        </button>
    )
}

function BrandPanel({ mode }: { mode: 'login' | 'register' }) {
    const { t } = useI18n()
    const content = t.auth.panel[mode]

    return (
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-[#0a4aa6] to-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky-400/25 blur-[100px]" />

            <Link href="/" className="relative inline-flex w-fit rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10">
                <BrandLogo className="text-[19px]" />
            </Link>

            <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative my-12 max-w-md"
            >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {content.badge}
                </span>
                <h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight xl:text-5xl">{content.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-blue-100/85">{content.subtitle}</p>

                <ul className="mt-10 space-y-3">
                    {content.points.map(({ title, text }, i) => {
                        const Icon = PANEL_ICONS[mode][i]
                        return (
                        <li key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <Icon aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span>
                                <span className="block font-display font-semibold">{title}</span>
                                <span className="mt-0.5 block text-sm leading-snug text-blue-100/75">{text}</span>
                            </span>
                        </li>
                        )
                    })}
                </ul>
            </motion.div>

            <p className="relative text-sm text-blue-100/60">&copy; {new Date().getFullYear()} ScholarizePath</p>
        </aside>
    )
}

export default function LoginForm() {
    // true = the Register panel is showing (legacy name from the sliding-panel UI).
    const [isLogin, setLogin] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)

    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [registerEmail, setRegisterEmail] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const [verificationCode, setVerificationCode] = useState("")

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useI18n()

    const mode = isLogin ? 'register' : 'login'

    useEffect(() => {
        if (searchParams.get("mode") === "register") {
            setLogin(true)
        }

        const googleError = searchParams.get("error")
        if (googleError) {
            // Leaves isLogin as-is (defaults to the Sign In panel) — Google
            // sign-in is reachable from both panels, but errors most often
            // come from someone trying to sign in, not register.
            setError(t.auth.googleErrors[googleError] || t.auth.genericError)
        }
    }, [searchParams, t])

    const handleToggleMode = (status: boolean) => {
        setError("")
        setIsVerifying(false)
        setLogin(status)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !registerPassword) {
            setError(t.auth.fillAll)
            return
        }

        if (registerPassword.length < 8) {
            setError(t.auth.passwordTooShort)
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: registerEmail,
                    password: registerPassword,
                })
            })

            const data = await response.json()

            if (data.success) {
                setIsVerifying(true)
            } else {
                setError(apiMessage(t, data.message, t.auth.registrationFailed))
            }
        } catch {
            setError(t.auth.registrationError)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!verificationCode.trim() || verificationCode.length !== 6) {
            setError(t.auth.invalidCode)
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: verificationCode,
                })
            })

            const data = await response.json()

            if (data.success) {
                router.push("/profile/setup")
            } else {
                setError(apiMessage(t, data.message, t.auth.codeExpired))
            }
        } catch {
            setError(t.auth.verificationError)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!loginEmail.trim() || !loginPassword) {
            setError(t.auth.fillAll)
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                })
            })

            const data = await response.json()

            if (data.success) {
                // Back to the page that sent them here (e.g. a scholarship they tried to save).
                // Same-site paths only, so the link can't be used to redirect elsewhere.
                const from = searchParams.get("from")
                router.push(from && /^\/(?![/\\])/.test(from) ? from : "/dashboard")
            } else {
                setError(apiMessage(t, data.message, t.auth.invalidLogin))
            }
        } catch {
            setError(t.auth.loginError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid min-h-screen grid-cols-1 bg-[#f7f9fc] font-body text-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <BrandPanel mode={mode} />

            <div className="flex min-w-0 flex-col px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] px-2 -mx-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink"
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        {t.auth.backHome}
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="lg:hidden">
                            <BrandLogo className="text-[15px] sm:text-[17px]" taglineClassName="hidden sm:block" nameClassName="max-[459px]:hidden" />
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
                    <motion.div
                        key={isVerifying ? 'verify' : mode}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-[440px] rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(10,26,63,0.06)] sm:p-9"
                    >
                        {mode === 'register' && isVerifying ? (
                            <>
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand">
                                    <MailCheck aria-hidden="true" className="h-6 w-6" />
                                </span>
                                <h1 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">{t.auth.checkEmail}</h1>
                                <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                                    {t.auth.sentCodeTo} <span className="font-semibold text-ink break-words">{registerEmail}</span>
                                </p>

                                <form onSubmit={handleVerifyCode} className="mt-7 flex flex-col gap-4">
                                    {error && <ErrorMessage message={error} />}
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="verification-code" className="text-sm font-medium text-ink">{t.auth.codeLabel}</label>
                                        <input
                                            type="text"
                                            id="verification-code"
                                            name="one-time-code"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            placeholder="123456"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                            className="h-14 w-full rounded-[10px] border border-slate-200 bg-white text-center font-display text-2xl font-bold tracking-[0.5em] text-ink placeholder:text-slate-300 shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                        />
                                    </div>
                                    <SubmitButton loading={loading} label={t.auth.verify} loadingLabel={t.auth.verifying} />
                                    <button
                                        type="button"
                                        onClick={() => setIsVerifying(false)}
                                        className="mx-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:text-ink"
                                    >
                                        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                                        {t.auth.backToRegistration}
                                    </button>
                                </form>
                            </>
                        ) : mode === 'register' ? (
                            <>
                                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">{t.auth.createTitle}</h1>
                                <p className="mt-2 text-[15px] text-slate-500">
                                    {t.auth.haveAccount}{' '}
                                    <button type="button" onClick={() => handleToggleMode(false)} className="font-semibold text-brand hover:underline">
                                        {t.auth.signIn}
                                    </button>
                                </p>

                                <div className="mt-7 flex flex-col gap-5">
                                    <GoogleButton label={t.auth.signUpGoogle} />
                                    <OrDivider />
                                </div>

                                <form onSubmit={handleRegister} className="mt-5 flex flex-col gap-4">
                                    {error && <ErrorMessage message={error} />}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field id="register-first-name" label={t.auth.firstName} icon={User}>
                                            <input
                                                type="text"
                                                id="register-first-name"
                                                name="given-name"
                                                autoComplete="given-name"
                                                placeholder={t.auth.firstNamePlaceholder}
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field id="register-last-name" label={t.auth.lastName} icon={User}>
                                            <input
                                                type="text"
                                                id="register-last-name"
                                                name="family-name"
                                                autoComplete="family-name"
                                                placeholder={t.auth.lastNamePlaceholder}
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>
                                    <Field id="register-email" label={t.auth.email} icon={Mail}>
                                        <input
                                            type="email"
                                            id="register-email"
                                            name="email"
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            className={inputClass}
                                        />
                                    </Field>
                                    <div className="flex flex-col gap-1.5">
                                        <Field id="register-password" label={t.auth.password} icon={Lock}>
                                            <PasswordInput
                                                id="register-password"
                                                name="new-password"
                                                autoComplete="new-password"
                                                placeholder={t.auth.passwordPlaceholderNew}
                                                aria-describedby="register-password-hint"
                                                value={registerPassword}
                                                onChange={(e) => setRegisterPassword(e.target.value)}
                                            />
                                        </Field>
                                        <p id="register-password-hint" className="text-xs text-slate-500">{t.auth.passwordHint}</p>
                                    </div>
                                    <SubmitButton loading={loading} label={t.auth.createAccount} loadingLabel={t.auth.sendingCode} />
                                </form>
                            </>
                        ) : (
                            <>
                                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">{t.auth.signInTitle}</h1>
                                <p className="mt-2 text-[15px] text-slate-500">
                                    {t.auth.newHere}{' '}
                                    <button type="button" onClick={() => handleToggleMode(true)} className="font-semibold text-brand hover:underline">
                                        {t.auth.createAnAccount}
                                    </button>
                                </p>

                                <div className="mt-7 flex flex-col gap-5">
                                    <GoogleButton label={t.auth.continueGoogle} />
                                    <OrDivider />
                                </div>

                                <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-4">
                                    {error && <ErrorMessage message={error} />}
                                    <Field id="login-email" label={t.auth.email} icon={Mail}>
                                        <input
                                            type="email"
                                            id="login-email"
                                            name="email"
                                            placeholder="name@example.com"
                                            autoComplete="username"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field id="login-password" label={t.auth.password} icon={Lock}>
                                        <PasswordInput
                                            id="login-password"
                                            name="password"
                                            placeholder={t.auth.passwordPlaceholder}
                                            autoComplete="current-password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                        />
                                    </Field>
                                    <SubmitButton loading={loading} label={t.auth.signInButton} loadingLabel={t.auth.signingIn} />
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
