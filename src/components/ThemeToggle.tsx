"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-card dark:hover:bg-secondary transition-colors border border-slate-200/50 dark:border-border outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)] group"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] transition-all text-slate-600 dark:text-muted-foreground dark:hidden" />
      <Moon className="h-[1.2rem] w-[1.2rem] transition-all text-slate-600 dark:text-foreground hidden dark:block" />
    </button>
  )
}
