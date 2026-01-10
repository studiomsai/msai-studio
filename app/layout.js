import './globals.css'
import Navigation from './components/Navigation'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Martel+Sans:wght@200;300;400;600;700;800;900&family=TikTok+Sans:opsz,wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans">
        <Navigation />

        {/* Main Content Area */}
        {children}

        {/* Footer */}
        <footer className="bg-black  mt-20">
          <div className="max-w-7xl mx-auto py-20 px-5">
            <div className="footer-top flex justify-between mb-6 gap-15">
              <div className="w-1/3">
                <img src="/image/msai-studio.svg" alt="Site Logo" className='mb-4' />
                <p>At msai.studio, anyone can create amazing AI-powered videos and images no coding, no setup, no experience needed. We make powerful creative tools simple, fun, and affordable for everyone. Each app on msai.studio runs advanced AI workflows in the background while you focus on the result from turning a selfie into cinematic motion to creating full story-based videos or photo shoots in seconds.Our goal is to make professional AI creation effortless and accessible so you can bring your ideas to life, anytime, anywhere.</p>
              </div>
              <div className="w-auto ml-auto mr-0">
                <h3 className="text-xl font-semibold mb-3">Quick link</h3>
                <ul>
                  <li><a href="/about" className="mb-2 text-lg hover:text-[#00C0FF]">About</a></li>
                  <li><a href="/contact" className="mb-2 text-lg hover:text-[#00C0FF]">Contact</a></li>
                  <li><a href="/terms" className="mb-2 text-lg hover:text-[#00C0FF]">Terms of Service</a></li>
                  <li><a href="/privacy" className="mb-2 text-lg hover:text-[#00C0FF]">Privacy Policy</a></li>
                </ul>
              </div>
              <div className="w-auto">
                <h3 className="text-xl font-semibold mb-3">Social link</h3>
                <ul>
                  <li><a href="/about" className="mb-2 text-lg hover:text-[#00C0FF]">LinkedIn</a></li>
                  <li><a href="/contact" className="mb-2 text-lg hover:text-[#00C0FF]">YouTube</a></li>
                  <li><a href="/terms" className="mb-2 text-lg hover:text-[#00C0FF]">Instagram</a></li>
                </ul>
              </div>
              <div className="w-auto">
                <h3 className="text-xl font-semibold mb-3">Company</h3>
                <ul>
                  <li><a href="/about" className="mb-2 text-lg hover:text-[#00C0FF]">Privacy Policy</a></li>
                  <li><a href="/contact" className="mb-2 text-lg hover:text-[#00C0FF]">Teams & Condition</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
