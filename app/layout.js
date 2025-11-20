import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'msai.studio',
  description: 'AI Creative Suite',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">
        {/* Navigation Bar */}
        <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur text-white p-4 flex justify-between items-center border-b border-white/10">
          <div className="text-xl font-bold tracking-tighter">msai.studio</div>
 <div className="space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <Link href="/apps" className="hover:text-blue-400 transition">AI Apps</Link>
            <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
            <Link href="/shop" className="hover:text-blue-400 transition">Shop</Link>
          </div>

        {/* Main Content Area */}
        {children}

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-20">
          <p>© 2025 msai.studio – Affordable for ALL.</p>
        </footer>
      </body>
    </html>
  )
}
