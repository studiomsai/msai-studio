import Link from 'next/link'
import Image from 'next/image'
import Shop from './Page/shop/page'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="main-banner relative h-screen flex items-center justify-center text-center text-white overflow-hidden bg-black bg-opacity-25">
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
      <div className="max-w-6xl mx-auto py-20 px-5">
        <h2 className="text-2xl md:text-4xl font-medium text-center mb-16 sub-title">Next-Gen AI Videos for Every Need</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {/* App 1 */}
          <div className="service-box">
            <Image src="/icon/smile.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Your Mood Today</h3>
            <p className="service-details mb-4">Turn your selfie into a mood animation. Upload a portrait and let AI animate your emotions.</p>
            <a href="/Service/mood-today" className="primary-outline-btn">Run App</a>
          </div>
          
          {/* App 2 */}
          <div className="service-box">
            <Image src="/icon/photo.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">10 expression</h3>
            <p className="service-details mb-4">Complete AI fashion photography studio. Generate professional headshots and full-body fashion looks.</p>
             <a href="/Service/10expression" className="primary-outline-btn">Run App</a>
          </div>

          {/* App 3 */}
          <div className="service-box">
            <Image src="/icon/video.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Caricature Video</h3>
            <p className="service-details mb-4">Turn text into cinematic video. Write a script and watch it come to life in seconds.</p>
             <a href="/Service/caricature-video" className="primary-outline-btn">Run App</a>
          </div>

          {/* App 4 */}
          <div className="service-box">
           <Image src="/icon/smile.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Expression Video</h3>
            <p className="service-details mb-4">Turn text into cinematic video.</p>
             <a href="/Service/expression-video" className="primary-outline-btn">Run App</a>
          </div>

          {/* App 5 */}
          <div className="service-box">
           <Image src="/icon/smile.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Expression 5 Image 20 seconds video </h3>
            <p className="service-details mb-4">Turn text into cinematic video.</p>
            <a href="/Service/expressions-5-images-20sec-video" className="primary-outline-btn">Run App</a>
          </div>

            {/* App 6 */}
          <div className="service-box">
            <Image src="/icon/smile.svg" alt="Mood Animation Icon" width={48} height={48}  className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Dual Selfie</h3>
            <p className="service-details mb-4">Turn text into cinematic video.</p>
             <a href="/Service/dual-selfie" className="primary-outline-btn">Run App</a>
          </div>

             {/* App 7 */}
          <div className="service-box">
            <Image src="/icon/smile.svg" alt="Mood Animation Icon" width={48} height={48} className="w-12 h-12 mb-4"/>
            <h3 className="service-title">Popcorn on Steroids</h3>
            <p className="service-details mb-4">Turn text into cinematic video.</p>
             <a href="/Service/popcorn-on-steroids" className="primary-outline-btn">Run App</a>
          </div>
        </div>
      </div>

      {/* Shop Section */}
      <Shop />
    </main>
  )
}