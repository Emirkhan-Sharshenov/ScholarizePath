'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Send, CheckCheck } from 'lucide-react';
import type { ScholarshipCardData, UniversityCardData } from './aiRecommendation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface AIChatCardProps {
    onRecommendations?: (data: {
        scholarships: ScholarshipCardData[];
        universities: UniversityCardData[];
    }) => void;
}

function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AIChatCard({ onRecommendations }: AIChatCardProps) {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'user',
            content: 'I want to study MS in Computer Science in Canada with a scholarship.',
            timestamp: '10:30 AM',
        },
        {
            role: 'assistant',
            content:
                "Great choice! Canada has excellent universities and plenty of scholarship opportunities for MS in Computer Science. Ask me anything and I'll pull real matches for you.",
            timestamp: '10:30 AM',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg: Message = { role: 'user', content: trimmed, timestamp: timeNow() };
        const history = messages.map((m) => ({ role: m.role, content: m.content }));

        setMessages((prev) => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, history }),
            });

            if (!res.ok) throw new Error('Request failed');
            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.reply ?? "Here's what I found.",
                    timestamp: timeNow(),
                },
            ]);

            onRecommendations?.({
                scholarships: data.scholarships ?? [],
                universities: data.universities ?? [],
            });
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "Sorry, something went wrong on my end. Please try again.",
                    timestamp: timeNow(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => sendMessage(inputMessage);

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 font-sans flex flex-col justify-between min-h-[700px]">

            {/* Top Section: Header & Chat History */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100/80">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                                Hello, Student!
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-1">
                                I'm your AI assistant. I can help you find the best scholarships, universities, and opportunities tailored just for you.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 pt-2 max-h-[420px] overflow-y-auto pr-1">
                    {messages.map((msg, i) =>
                        msg.role === 'user' ? (
                            <div key={i} className="flex flex-col items-end">
                                <div className="max-w-[85%] sm:max-w-md bg-slate-100/80 rounded-2xl rounded-tr-xs px-4 py-3 text-slate-800 text-xs md:text-sm">
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 pr-1">
                                    <span>{msg.timestamp}</span>
                                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                            </div>
                        ) : (
                            <div key={i} className="flex items-start gap-3 max-w-[90%] sm:max-w-xl">
                                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Image src="/images/aibot/bot-avatar.png" alt="AI Assistant" width={32} height={32} className="rounded-full" />
                                </div>
                                <div>
                                    <div className="bg-blue-50/60 rounded-2xl rounded-tl-xs px-4 py-3 text-slate-800 text-xs md:text-sm leading-relaxed">
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 pl-1 block">{msg.timestamp}</span>
                                </div>
                            </div>
                        )
                    )}

                    {isLoading && (
                        <div className="flex items-center gap-3 pl-11 text-xs text-slate-400 animate-pulse">
                            Thinking…
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Input & Submit Button */}
            <div className="space-y-3 pt-4">
                <div className="relative flex items-center bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 p-2 pl-4 transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 shadow-xs">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                        }}
                        placeholder="Ask anything about scholarships, universities, or applications..."
                        className="w-full bg-transparent text-xs md:text-sm text-slate-800 placeholder-slate-400 outline-none pr-3 py-1.5"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !inputMessage.trim()}
                        className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-[11px] text-center text-slate-400">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>

        </div>
    );
}