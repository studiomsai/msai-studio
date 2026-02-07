import Link from 'next/link'
import Image from 'next/image'
import Shop from './Page/shop/page'
import App from './Page/apps/page'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="main-banner relative h-[650px] md:h-screen flex items-center justify-center text-center text-white overflow-hidden bg-black bg-opacity-25">
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-20"
        >
          <source src="https://cdn.pixabay.com/video/2021/07/30/83284-584710668_medium.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/80 -z-10"></div>
        
        {/* Content */}
        <div className="max-w-3xl p-5 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg title">
            Create stunning <br/>AI videos in minutes.
          </h1>
          <p className="text-xl text-slate-200 mb-10 drop-shadow-md">
            Pick an app. Upload. Watch the magic.
          </p>
          <Link
            href="/Service/mood-today"
            className="primary-btn"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Apps Preview Section */}
      <App />

      {/* Shop Section */}
      <Shop />
    </main>
  )
}