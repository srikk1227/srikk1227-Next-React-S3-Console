"use client";
import { SignUp } from "@clerk/nextjs";
import { useTheme } from "@/components/ThemeProvider";

export default function SignUpPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          hideSignIn={false}
          signInUrl="/sign-in"
          appearance={{
            variables: isDark
              ? {
                  colorBackground: "#0f172a",
                  colorText: "#ffffff",
                  colorInputBackground: "#1e293b",
                  colorInputText: "#ffffff",
                  colorPrimary: "#3b82f6",
                  colorPrimaryText: "#ffffff",
                  colorAlphaShade: "#334155",
                }
              : {
                  colorBackground: "#ffffff",
                  colorText: "#000000",
                  colorInputBackground: "#f9fafb",
                  colorInputText: "#000000",
                  colorPrimary: "#3b82f6",
                  colorPrimaryText: "#ffffff",
                  colorAlphaShade: "#e5e7eb",
                },
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border border-border bg-card",
              formButtonPrimary:
                "bg-blue-500 hover:bg-blue-600 text-white",
              formFieldInput: isDark
                ? "bg-slate-800 text-white border border-slate-700"
                : "bg-white text-black border border-gray-300",
              formFieldLabel: isDark
                ? "text-slate-300"
                : "text-gray-700",
              footerAction: isDark
                ? "text-slate-400"
                : "text-gray-500",
              footerActionLink:
                "text-blue-500 hover:text-blue-400 transition-colors",
              socialButtonsBlockButton: isDark
                ? "bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                : "bg-white text-black border border-gray-300 hover:bg-gray-100",
              socialButtonsBlockButtonText: isDark
                ? "text-white"
                : "text-black",
              socialButtonsBlockButtonArrow: isDark
                ? "text-white"
                : "text-black",
            },
          }}
        />
      </div>
    </div>
  );
}