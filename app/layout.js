import "./globals.css";

export const metadata = {
  title: "Troupe OS",
  description: "Web-based operating system control surface.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
