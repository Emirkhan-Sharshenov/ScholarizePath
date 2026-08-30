'use client'

import { useState } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
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

    const handleToggleMode = (status: boolean) => {
        setError("")
        setIsVerifying(false)
        setLogin(status)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !registerPassword) {
            setError("Please fill in all fields")
            return
        }

        if (registerPassword.length < 8) {
            setError("Password must be at least 8 characters")
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
                setError(data.message || "Registration failed")
            }
        } catch {
            setError("An error occurred during registration.")
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!verificationCode.trim() || verificationCode.length !== 6) {
            setError("Please enter a valid 6-digit code")
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
                setError(data.message || "Invalid or expired code")
            }
        } catch {
            setError("An error occurred during verification.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!loginEmail.trim() || !loginPassword) {
            setError("Please fill in all fields")
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
                router.push("/dashboard")
            } else {
                setError(data.message || "Invalid email or password")
            }
        } catch {
            setError("An error occurred during login.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#000139] overflow-hidden p-4 sm:p-6">
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-[900px] h-[580px] md:h-[550px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col md:flex-row">

         
                <div
                    className={`absolute md:relative left-0 top-0 w-full md:w-1/2 h-full flex flex-col justify-center items-center px-6 transition-all duration-700 ease-in-out ${isLogin
                        ? "-translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:-translate-x-full"
                        : "translate-y-0 opacity-100 md:translate-x-0"
                        } pb-14 md:pb-0`}
                >
                    <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#000139]">Sign In</h1>

                        {error && !isLogin && (
                            <div className="w-full bg-red-50 text-red-500 text-xs text-center py-2 px-3 rounded-md mb-3 border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                            <input
                                type="email"
                                id="login-email"
                                name="email"
                                placeholder="Email"
                                autoComplete="username"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                            />
                            <input
                                type="password"
                                id="login-password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    </div>
                </div>

                <div
                    className={`absolute md:relative right-0 top-0 w-full md:w-1/2 h-full flex flex-col justify-center items-center px-6 transition-all duration-700 ease-in-out ${isLogin
                        ? "translate-y-0 opacity-100 md:translate-x-0"
                        : "translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:translate-x-full"
                        } pt-14 md:pt-0`}
                >
                    <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center">
                        {isVerifying ? (
                            <>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#000139] text-center">Verify Email</h1>
                                <p className="text-xs text-gray-500 text-center mb-4">
                                    We sent a 6-digit code to <span className="font-semibold text-gray-700">{registerEmail}</span>
                                </p>

                                {error && (
                                    <div className="w-full bg-red-50 text-red-500 text-xs text-center py-1.5 px-3 rounded-md mb-2 border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-4">
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
                                        className="w-full text-center tracking-[10px] text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg outline-none py-2 text-gray-800 focus:border-blue-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? "Verifying..." : "Verify & Continue"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsVerifying(false)}
                                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center w-full"
                                    >
                                        Back to registration
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#000139]">Register</h1>

                                {error && isLogin && (
                                    <div className="w-full bg-red-50 text-red-500 text-xs text-center py-1.5 px-3 rounded-md mb-2 border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="w-full flex flex-col gap-3">
                                    <input
                                        type="text"
                                        id="register-first-name"
                                        name="given-name"
                                        autoComplete="given-name"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                                    />
                                    <input
                                        type="text"
                                        id="register-last-name"
                                        name="family-name"
                                        autoComplete="family-name"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                                    />
                                    <input
                                        type="email"
                                        id="register-email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="Email"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                                    />
                                    <input
                                        type="password"
                                        id="register-password"
                                        name="new-password"
                                        autoComplete="new-password"
                                        placeholder="Password (min. 8 characters)"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 focus:border-[#000139] transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? "Sending Code..." : "Sign Up"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                <div
                    className={`absolute z-20 bg-blue-500 transition-all duration-700 ease-in-out ${isLogin
                        ? "top-0 left-0 w-full h-14 rounded-b-2xl md:h-full md:w-1/2 md:rounded-none md:translate-x-0"
                        : "top-[calc(100%-3.5rem)] left-0 w-full h-14 rounded-t-2xl md:top-0 md:h-full md:w-1/2 md:rounded-none md:translate-x-full"
                        }`}
                >
                    <div className={`hidden md:flex absolute inset-0 flex-col items-center justify-center text-white transition-all duration-500 ${isLogin ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}`}>
                        <h2 className="text-4xl font-bold">Hello, Friend!</h2>
                        <p className="mt-4 text-center px-10">Don't have an account?</p>
                        <button type="button" onClick={() => handleToggleMode(true)} className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer font-semibold">
                            Register
                        </button>
                    </div>

                    <div className={`hidden md:flex absolute inset-0 flex-col items-center justify-center text-white transition-all duration-500 ${isLogin ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"}`}>
                        <h2 className="text-4xl font-bold">Welcome Back!</h2>
                        <p className="mt-4 text-center px-10">Already have an account?</p>
                        <button type="button" onClick={() => handleToggleMode(false)} className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer font-semibold">
                            Sign In
                        </button>
                    </div>

                    <div className="flex md:hidden h-full items-center justify-between px-6 text-white">
                        <span className="text-xs font-medium opacity-90">
                            {isLogin ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <button type="button" onClick={() => handleToggleMode(!isLogin)} className="px-4 py-1 rounded-full border border-white text-xs font-semibold active:scale-95 transition-transform">
                            {isLogin ? "Sign In" : "Register"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}