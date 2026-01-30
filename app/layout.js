import './globals.css'
import Image from 'next/image'
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
        <footer className="bg-black  py-20 px-5">
          <div className="container mx-auto">
            <div className="footer-top flex justify-between mb-6 gap-15">
              <div className="w-1/3">
                <Image src="/image/msai-studio.svg" alt="Site Logo" className='mb-4'  width={175} height={24}/>
                <p>At msai.studio, anyone can create amazing AI-powered videos and images no coding, no setup, no experience needed. We make powerful creative tools simple, fun, and affordable for everyone. Each app on msai.studio runs advanced AI workflows in the background while you focus on the result from turning a selfie into cinematic motion to creating full story-based videos or photo shoots in seconds.Our goal is to make professional AI creation effortless and accessible so you can bring your ideas to life, anytime, anywhere.</p>
              </div>
              <div className="w-auto ml-auto mr-0">
                <h3 className="text-xl font-semibold mb-3">Quick link</h3>
                <ul>
                  <li><a href="/about" className="mb-2 text-lg hover:text-[#00C0FF]">About</a></li>
                  <li><a href="/Page/contact" className="mb-2 text-lg hover:text-[#00C0FF]">Contact</a></li>
                  <li><a href="/Page/apps" className="mb-2 text-lg hover:text-[#00C0FF]">Our Service</a></li>
                   <li><a href="/Page/shop" className="mb-2 text-lg hover:text-[#00C0FF]">Purchase Credit</a></li>
                </ul>
              </div>
              <div className="w-auto">
                <h3 className="text-xl font-semibold mb-3">Social link</h3>
                <ul>
                  <li><a href="/Page/about" className="mb-2 text-lg hover:text-[#00C0FF]"><Image className='mr-2' src="/icon/linkedin.svg" alt="linkedin" width={24} height={24} />Linkedin</a></li>
                  <li><a href="/Page/contact" className="mb-2 text-lg hover:text-[#00C0FF]"> <Image className='mr-2' src="/icon/youtube.svg" alt="youtube" width={24} height={24} />YouTube</a></li>
                  <li><a href="/terms" className="mb-2 text-lg hover:text-[#00C0FF]"><Image className='mr-2' src="/icon/instagram.svg" alt="instagram" width={24} height={24} />Instagram</a></li>
                </ul>
              </div>
              <div className="w-auto">
                <h3 className="text-xl font-semibold mb-3">Company</h3>
                <ul>
                  <li><a href="/Page/privacy" className="mb-2 text-lg hover:text-[#00C0FF]">Privacy Policy</a></li>
                  <li><a href="/Page/terms" className="mb-2 text-lg hover:text-[#00C0FF]">Terms & Conditions</a></li>
                </ul>
              </div>
            </div>
            <div className='footer-bottom border-t border-slate-400 pt-6'>
              <p className="text-center text-white">© 2026 msai.studio - Powered by Hn9 Codecraft.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
