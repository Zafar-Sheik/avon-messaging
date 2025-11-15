"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Sparkles, MoonStar, Code, Terminal } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const Icon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "modern":
        return <Sparkles className="h-4 w-4" />;
      case "modern-dark":
        return <MoonStar className="h-4 w-4" />;
      case "vibe-coding":
        return <Code className="h-4 w-4" />;
      case "vibe-coding-dark":
        return <Terminal className="h-4 w-4" />;
      case "light":
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const displayName =
    theme === "modern-dark"
      ? "Modern Dark"
      : theme === "modern"
      ? "Modern"
      : theme === "vibe-coding-dark"
      ? "Vibe Coding Dark"
      : theme === "vibe-coding"
      ? "Vibe Coding"
      : theme
      ? theme[0].toUpperCase() + theme.slice(1)
      : "Theme";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon />
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Sun className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("modern")}>
          <Sparkles className="mr-2 h-4 w-4" />
          Modern
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("modern-dark")}>
          <MoonStar className="mr-2 h-4 w-4" />
          Modern Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vibe-coding")}>
          <Code className="mr-2 h-4 w-4" />
          Vibe Coding
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("vibe-coding-dark")}>
          <Terminal className="mr-2 h-4 w-4" />
          Vibe Coding Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;