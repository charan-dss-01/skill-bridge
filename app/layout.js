import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning className="dark">
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {/* ADD THIS LINE 👇 */}
            <div className="grid-background" />

            <Header />

            <main className="relative z-10 min-h-screen">
              {children}
            </main>

            <Toaster richColors />

            <footer className="bg-muted/50 py-12 relative z-10">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 💗 by SigmaCoders</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>

      </html>
    </ClerkProvider>
  );
}
