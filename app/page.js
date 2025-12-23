import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
            Create with AI.<br/>Limitless Potential.
          </h1>
          <p className="text-xl text-slate-200 mb-10 drop-shadow-md">
            Generate videos, photoshoots, and stories in seconds.
          </p>
          <Link 
            href="/mood-today" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-lg shadow-blue-600/40"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Apps Preview Section */}
      <div className="max-w-6xl mx-auto py-20 px-5">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">AI Apps Available</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* App 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition hover:-translate-y-1">
            <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full">😊</div>
            <h3 className="text-2xl font-bold mb-2">Your Mood Today</h3>
            <p className="text-slate-500">Turn your selfie into a mood animation.</p>
          </div>
          
          {/* App 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition hover:-translate-y-1">
            <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full">📸</div>
            <h3 className="text-2xl font-bold mb-2">Dual Selfie</h3>
            <p className="text-slate-500">Complete AI fashion photography studio.</p>
          </div>

          {/* App 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition hover:-translate-y-1">
            <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full">🎬</div>
            <h3 className="text-2xl font-bold mb-2">10 expression</h3>
            <p className="text-slate-500">Turn text into cinematic video.</p>
          </div>

          {/* App 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition hover:-translate-y-1">
            <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full">🎬</div>
            <h3 className="text-2xl font-bold mb-2">Caricature Video</h3>
            <p className="text-slate-500">Turn text into cinematic video.</p>
          </div>

          {/* App 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition hover:-translate-y-1">
            <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-full">🎬</div>
            <h3 className="text-2xl font-bold mb-2">Expression Video</h3>
            <p className="text-slate-500">Turn text into cinematic video.</p>
          </div>
        </div>
        <div className="text-center mt-10 text-slate-400">More to Come Soon...</div>
      </div>
    </main>
  )
}