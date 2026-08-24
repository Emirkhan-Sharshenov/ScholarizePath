'use client'

import { useState, useEffect, Suspense } from 'react'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginFormContent() {
    const [isLogin, setLogin] = useState(false)
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [registerEmail, setRegisterEmail] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    // Status states
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()

    // Проверяем, вернулся ли пользователь после клика из письма (?verified=true)
    useEffect(() => {
        if (searchParams.get("verified") === "true") {
            setSuccessMessage("Email successfully verified! You can now log in.")
            setLogin(false) // Открываем панель логина
        }
    }, [searchParams])

    const handleToggleMode = (status: boolean) => {
        setError("")
        setSuccessMessage("")
        setLogin(status)
    }

    const handleRegister = async () => {
        setError("")
        setSuccessMessage("")

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
                setSuccessMessage("Registration successful! Please check your email to verify your account.")
                // Сбрасываем поля и переключаем на панель входа
                setRegisterEmail("")
                setRegisterPassword("")
                setFirstName("")
                setLastName("")
                setLogin(false)
            } else {
                setError(data.message || "Registration failed")
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async () => {
        setError("")
        setSuccessMessage("")

        if (!loginEmail.trim() || !loginPassword) {
            setError("Please fill in all fields")
            return
        }

        if (loginPassword.length < 8) {
            setError("Password must be at least 8 characters")
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
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#000139] overflow-hidden p-4 sm:p-6">
            {/* Background Particles */}
            <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
                {[
                    { left: "5%", top: "10%", delay: "0s" },
                    { left: "12%", top: "30%", delay: ".3s" },
                    { left: "18%", top: "70%", delay: ".8s" },
                    { left: "25%", top: "15%", delay: "1.2s" },
                    { left: "30%", top: "55%", delay: ".6s" },
                    { left: "38%", top: "80%", delay: "1.4s" },
                    { left: "45%", top: "25%", delay: ".5s" },
                    { left: "52%", top: "60%", delay: "1.7s" },
                    { left: "58%", top: "8%", delay: ".2s" },
                    { left: "64%", top: "40%", delay: "1s" },
                    { left: "70%", top: "75%", delay: ".7s" },
                    { left: "76%", top: "18%", delay: "1.5s" },
                    { left: "82%", top: "50%", delay: ".9s" },
                    { left: "88%", top: "85%", delay: "1.3s" },
                    { left: "94%", top: "35%", delay: ".4s" },
                    { left: "8%", top: "90%", delay: "1.8s" },
                    { left: "20%", top: "45%", delay: ".1s" },
                    { left: "34%", top: "5%", delay: ".6s" },
                    { left: "48%", top: "92%", delay: "1.1s" },
                    { left: "62%", top: "22%", delay: ".2s" },
                    { left: "74%", top: "58%", delay: "1.6s" },
                    { left: "86%", top: "12%", delay: ".8s" },
                    { left: "96%", top: "65%", delay: "1.4s" },
                ].map((p, i) => (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            left: p.left,
                            top: p.top,
                            animationDelay: p.delay,
                        }}
                    />
                ))}
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-[900px] h-[580px] md:h-[550px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col md:flex-row">

                {/* LOGIN FORM PANEL */}
                <div
                    className={`absolute md:relative left-0 top-0 w-full md:w-1/2 h-full flex flex-col justify-center items-center px-6 transition-all duration-700 ease-in-out ${isLogin
                        ? "-translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:-translate-x-full"
                        : "translate-y-0 opacity-100 md:translate-x-0"
                        } pb-14 md:pb-0`}
                >
                    <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#000139]">Sign In</h1>

                        {/* Success Banner */}
                        {successMessage && !isLogin && (
                            <div className="w-full bg-green-50 text-green-700 text-xs text-center py-2 px-3 rounded-md mb-3 border border-green-200">
                                {successMessage}
                            </div>
                        )}

                        {/* Error Banner */}
                        {error && !isLogin && (
                            <div className="w-full bg-red-50 text-red-500 text-xs text-center py-2 px-3 rounded-md mb-3 border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="w-full flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Password (min. 8 characters)"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* REGISTER FORM PANEL */}
                <div
                    className={`absolute md:relative right-0 top-0 w-full md:w-1/2 h-full flex flex-col justify-center items-center px-6 transition-all duration-700 ease-in-out ${isLogin
                        ? "translate-y-0 opacity-100 md:translate-x-0"
                        : "translate-y-full opacity-0 pointer-events-none md:translate-y-0 md:translate-x-full"
                        } pt-14 md:pt-0`}
                >
                    <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#000139]">Register</h1>

                        {/* Error Banner */}
                        {error && isLogin && (
                            <div className="w-full bg-red-50 text-red-500 text-xs text-center py-1.5 px-3 rounded-md mb-2 border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="w-full flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={registerEmail}
                                onChange={(e) => setRegisterEmail(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <input
                                type="password"
                                placeholder="Password (min. 8 characters)"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 outline-none py-1.5 px-1 text-gray-800 placeholder-gray-400 focus:border-[#000139] transition-colors"
                            />
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full mt-2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? "Creating Account..." : "Sign Up"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* SLIDING BLUE OVERLAY PANEL */}
                <div
                    className={`absolute z-20 bg-blue-500 transition-all duration-700 ease-in-out ${isLogin
                        ? "top-0 left-0 w-full h-14 rounded-b-2xl md:h-full md:w-1/2 md:rounded-none md:translate-x-0"
                        : "top-[calc(100%-3.5rem)] left-0 w-full h-14 rounded-t-2xl md:top-0 md:h-full md:w-1/2 md:rounded-none md:translate-x-full"
                        }`}
                >
                    {/* DESKTOP CONTENT: Register Prompt */}
                    <div
                        className={`hidden md:flex absolute inset-0 flex-col items-center justify-center text-white transition-all duration-500 ${isLogin
                            ? "opacity-0 translate-x-10 pointer-events-none"
                            : "opacity-100 translate-x-0"
                            }`}
                    >
                        <h2 className="text-4xl font-bold">Hello, Friend!</h2>
                        <p className="mt-4 text-center px-10">Don't have an account?</p>
                        <button
                            onClick={() => handleToggleMode(true)}
                            className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer font-semibold"
                        >
                            Register
                        </button>
                    </div>

                    {/* DESKTOP CONTENT: Login Prompt */}
                    <div
                        className={`hidden md:flex absolute inset-0 flex-col items-center justify-center text-white transition-all duration-500 ${isLogin
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-10 pointer-events-none"
                            }`}
                    >
                        <h2 className="text-4xl font-bold">Welcome Back!</h2>
                        <p className="mt-4 text-center px-10">Already have an account?</p>
                        <button
                            onClick={() => handleToggleMode(false)}
                            className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer font-semibold"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* MOBILE CONTENT: Compact Floating Bar */}
                    <div className="flex md:hidden h-full items-center justify-between px-6 text-white">
                        <span className="text-xs font-medium opacity-90">
                            {isLogin ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <button
                            onClick={() => handleToggleMode(!isLogin)}
                            className="px-4 py-1 rounded-full border border-white text-xs font-semibold active:scale-95 transition-transform"
                        >
                            {isLogin ? "Sign In" : "Register"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

// Оборачиваем в Suspense из-за useSearchParams
export default function LoginForm() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#000139]" />}>
            <LoginFormContent />
        </Suspense>
    )
}