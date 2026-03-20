'use client'

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { ModeProvider } from "@/contexts/ModeContext"

import { ThemeProvider } from "@/components/ThemeProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider>
                <ModeProvider>
                    {children}
                    <Toaster />
                </ModeProvider>
            </SessionProvider>
        </ThemeProvider>
    )
}
