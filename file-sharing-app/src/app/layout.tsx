import Providers from "@/components/Providers"; // Import the wrapper

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers> {/* Client Component inside body */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
