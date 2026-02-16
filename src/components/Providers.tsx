'use client'

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { ModeProvider } from "@/contexts/ModeContext"

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ModeProvider>
                {children}
                <Toaster />
            </ModeProvider>
        </SessionProvider>
    )
}
