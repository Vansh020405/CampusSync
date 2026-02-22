"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, User, Sparkles, Loader2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function PlacementMentorChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I am your Campus Sync AI Mentor. Powered by your real academic and internship data, I can help you predict academic risks, build study plans, evaluate internship readiness, and simulate 'what-if' scenarios. How can I assist you today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isLoading]);

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        // We defer sending by a frame so the setInput state has time to update if we want to show it, 
        // but here we can just directly send the suggestion.
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/student/placement-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await response.json();
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.response };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "assistant", content: "I encountered an error processing your request. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Bubble */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60]"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="icon"
                            className="relative h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-slate-900 hover:scale-105 transition-transform border-4 border-white dark:border-slate-800 group"
                        >
                            <span className="absolute inset-0 rounded-full bg-blue-400 animate-pulse opacity-40 blur-md hidden group-hover:block" />
                            <Sparkles className="w-6 h-6 text-white absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                            <Bot className="w-7 h-7 text-white relative z-10" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] w-[calc(100vw-2rem)] md:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 border-b border-indigo-500/20 text-white shrink-0 shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-indigo-500/20 p-2 rounded-full border border-indigo-400/30">
                                    <Bot className="w-5 h-5 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm tracking-wide text-indigo-50 leading-tight">Campus Sync AI Mentor</h3>
                                    <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">Ask about academics, internships, resume, or performance.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative z-10">
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/90 relative"
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "",
                                        idx === 0 ? "mb-6" : "" // Extra spacing for initial message
                                    )}
                                >
                                    <div className={cn(
                                        "shrink-0 h-8 w-8 rounded-full flex items-center justify-center border",
                                        msg.role === "assistant" ? "bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300 shadow-sm" : "bg-slate-200 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-sm"
                                    )}>
                                        {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-tr-sm border border-indigo-500/50"
                                            : "bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
                                    <div className="shrink-0 h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300 shadow-sm flex items-center justify-center">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="px-4 py-4 rounded-2xl rounded-tl-sm bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/70 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            {messages.length === 1 && !isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-2 flex flex-wrap gap-2 justify-end"
                                >
                                    {[
                                        "Am I at risk?",
                                        "Improve my resume",
                                        "Create a 7-day study plan"
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                const syntheticEvent = { e: null } as any;
                                                // Pre-fill and send
                                                setInput(suggestion);
                                                setTimeout(() => {
                                                    document.getElementById("btn-send-chat")?.click();
                                                }, 50);
                                            }}
                                            className="text-xs px-3.5 py-1.5 bg-blue-50/80 dark:bg-slate-800 shadow-sm text-blue-700 dark:text-blue-300 font-medium rounded-full border border-blue-200 dark:border-slate-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800 dark:hover:bg-slate-700 dark:hover:text-blue-200 transition-all flex items-center gap-1.5"
                                        >
                                            <Sparkles className="h-3 w-3 opacity-70" /> {suggestion}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 shadow-[0_-4px_15px_-10px_rgba(0,0,0,0.1)] z-10">
                            <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask your AI Mentor..."
                                    className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-3 py-2.5 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <Button
                                    id="btn-send-chat"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                    className="shrink-0 h-[38px] w-[38px] mb-[3px] mr-[3px] rounded-[10px] bg-gradient-to-b from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 border border-indigo-500/20 text-white shadow-md disabled:from-slate-300 disabled:to-slate-400 disabled:border-transparent dark:disabled:from-slate-700 dark:disabled:to-slate-800"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
