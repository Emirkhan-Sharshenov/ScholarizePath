'use client'

import { useState } from 'react'
import React from 'react'

function LoginForm() {
  const [isLogin, setLogin] = useState(false)
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const handleRegister = async () => {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email: registerEmail,
                password: registerPassword,
            })
        })

        const data = await response.json()

        console.log(data)
        
        
       
    }

    const handleLogin = async() => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword,
            })

            


        })
        const data = await response.json()

        console.log(data)
    }
   
  return (
    <>
          <div className="relative flex items-center justify-center min-h-screen bg-[#000139] overflow-hidden">
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
              <div className="relative z-10 w-[900px] h-[550px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] scale-75">
            <div className={`absolute left-0 top-0 w-1/2 h-full transition-all duration-700 
                ${
                isLogin
                ? "-translate-x-full opacity-0" :
                  "translate-x-0 opacity-100"}`}>
                    <div className='h-full w-full flex flex-col justify-center items-center gap-6 scale-90'>
                     <h1 className='text-4xl font-bold mb-10'>Login</h1>
                      <input
                          type="email"
                          placeholder="Email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                      />

                      <input
                          type="password"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                      />
                          <button onClick={handleLogin} className="w-1/2 mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer">
                              Sign In
                          </button>
                      </div>
                      
                  </div>
            <div className={`absolute right-0 top-0 w-1/2 h-full transition-all duration-700
               ${
                isLogin
                ? "translate-x-0 opacity-100" :
                  "translate-x-full opacity-0"}
               `}>
                      <div className="h-full w-full flex flex-col justify-center items-center gap-6 scale-90">
                          <h1 className="text-4xl font-bold mb-6">Register</h1>

                          <input
                              type="text"
                              placeholder="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                              
                          />

                          <input
                              type="text"
                              placeholder="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                          />


                          <input
                              type="email"
                              placeholder="Email"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                          />

                          <input
                              type="password"
                              placeholder="Password"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="w-1/2 bg-transparent border-b-2 border-gray-300 outline-none py-2 px-1 focus:border-[#000139] transition-colors"
                          />
                          <button onClick={handleRegister} className="w-1/2 mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-300 cursor-pointer">
                              Sign Up
                          </button>
                      </div>
                </div>  
                  <div
                      className={`absolute top-0 w-1/2 h-full bg-blue-500 transition-all duration-700 ${isLogin ? "left-0" : "left-1/2"
                          }`}
                  >
                      {/* Register */}
                      <div
                          className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-all duration-500 ${isLogin
                                  ? "opacity-0 translate-x-10 pointer-events-none"
                                  : "opacity-100 translate-x-0"
                              }`}
                      >
                          <h2 className="text-4xl font-bold">Hello, Friend!</h2>

                          <p className="mt-4 text-center px-10">
                              Don't have an account? 
                          </p>

                          <button
                              onClick={() => setLogin(true)}
                              className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer"
                          >
                              Register
                          </button>
                      </div>

                      {/* Login */}
                      <div
                          className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-all duration-500 ${isLogin
                                  ? "opacity-100 translate-x-0"
                                  : "opacity-0 -translate-x-10 pointer-events-none"
                              }`}
                      >
                          <h2 className="text-4xl font-bold">Welcome!</h2>

                          <p className="mt-4 text-center px-10">
                              Already have an account?
                          </p>

                          <button
                              onClick={() => setLogin(false)}
                              className="mt-8 px-8 py-3 rounded-full border-2 border-white hover:bg-white hover:text-blue-500 transition cursor-pointer"
                          >
                              Sign In
                          </button>
                      </div>
                  </div>
        
          </div>
          </div>
    </>
  )
}

export default LoginForm