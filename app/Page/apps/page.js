import Link from 'next/link'

export default function Apps() {
  const apps = [
    {id: 'Mood', name: 'Your Mood Today', cost: 20, icon: '😊', desc: 'Turn your selfie into a mood animation. Upload a portrait and let AI animate your emotions.', link: '/Service/mood-today' },
    {id: 'Photo', name: '10 expression', cost: 15, icon: '📸', desc: 'Complete AI fashion photography studio. Generate professional headshots and full-body fashion looks.',link: '/Service/10expression'},
    {id: 'Video', name: 'Caricature Video', cost: 32, icon: '🎬', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/caricature-video'},
    {id: 'Story', name: 'Expression Video', cost: 32, icon: '🎬', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/expression-video'},
    {id: 'Selfie', name: 'Dual Selfie', cost: 32, icon: '🎬', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/dual-selfie'},
    {id: 'Imgvideo', name: 'Expression Images & Video', cost: 32, icon: '🎬', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/expressions-5-images-20sec-video'},
    {id: 'Imagination', name: 'Popcorn on Steroids', cost: 32, icon: '🎬', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/popcorn-on-steroids'}
  ]

  return (
    <div className="max-w-6xl mx-auto pt-32 px-5 pb-20">
      <h1 className="text-4xl font-bold text-center mb-16">AI Applications</h1>
      <div className="grid gap-8">
        {apps.map(app => (
          <div key={app.id} className="bg-white p-8 rounded-2xl shadow-sm border flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl bg-blue-50 w-24 h-24 flex items-center justify-center rounded-full flex-shrink-0">{app.icon}</div>
            <div className="flex-grow text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">{app.name}</h3>
                <p className="text-slate-500 mb-4">{app.desc}</p>
                <div className="text-blue-600 font-bold">{app.cost} Credits per run</div>
            </div>
            <Link href={app.link} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition whitespace-nowrap">
                Launch App
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}