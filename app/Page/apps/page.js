import Link from 'next/link'
import Image from 'next/image'

export default function Apps() {
  const apps = [
    {id: 'Mood', name: 'Your Mood Today', cost: 20, img: '/icon/smile.svg', desc: 'Turn your selfie into a mood animation. Upload a portrait and let AI animate your emotions.', link: '/Service/mood-today' },
    {id: 'Photo', name: '10 expression', cost: 15, img: '/icon/smile.svg', desc: 'Complete AI fashion photography studio. Generate professional headshots and full-body fashion looks.',link: '/Service/10expression'},
    {id: 'Video', name: 'Caricature Video', cost: 32, img: '/icon/smile.svg', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/caricature-video'},
    {id: 'Story', name: 'Expression Video', cost: 32, img: '/icon/smile.svg', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/expression-video'},
    {id: 'Selfie', name: 'Dual Selfie', cost: 32, img: '/icon/smile.svg', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/dual-selfie'},
    {id: 'Imgvideo', name: 'Expression Images & Video', cost: 32, img: '/icon/smile.svg', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/expressions-5-images-20sec-video'},
    {id: 'Imagination', name: 'Popcorn on Steroids', cost: 32, img: '/icon/smile.svg', desc: 'Turn text into cinematic video. Write a script and watch it come to life in seconds.', link: '/Service/popcorn-on-steroids'}
  ]

  return (
    <div className="container mx-auto pt-50 pb-30">
      <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">AI Applications</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {apps.map(app => (
          <div key={app.id} className="service-box">
             <Image src={app.img} alt={app.name} width={48} height={48} className="w-12 h-12 mb-4"/>
              <h3 className="service-title">{app.name}</h3>
              <p className="service-details mb-2">{app.desc}</p>
              <div className="font-bold mb-4">{app.cost} Credits per run</div>
            <Link href={app.link} className="primary-outline-btn">
               Run App
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}