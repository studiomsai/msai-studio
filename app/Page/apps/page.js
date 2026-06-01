import Link from 'next/link'
import Image from 'next/image'

export default function Apps() {
  const apps = [
    {id: 'Mood', name: 'Your Mood Today', cost: 30, img: '/icon/your-mood-today-update.svg', desc: 'Turn your selfie into a mood animation. Upload a portrait and let AI animate your emotions.', link: '/Service/mood-today' },
    {id: 'Photo', name: '10 expression', cost: 20, img: '/icon/10-expression-update.svg', desc: '10 Expression Images allows users to upload a single image and generate 10 different expression styles of that image.',link: '/Service/10expression'},
    {id: 'Video', name: 'Caricature Video', cost: 20, img: '/icon/caricature-video-update.svg', desc: 'Upload your portrait picture and receive a funny 12 seconds video with sound.', link: '/Service/caricature-video'},
    {id: 'Story', name: 'Expression Video', cost: 50, img: '/icon/expression-video-update.svg', desc: 'Expression video allows users to upload a single image and generate an expression video based on that image.', link: '/Service/expression-video'},
    {id: 'Selfie', name: 'Dual Selfie', cost: 20, img: '/icon/dual-selfie-update.svg', desc: 'Dual Selfie allows users to upload two different images and automatically merge them into one single, professionally styled selfie image.', link: '/Service/dual-selfie'},
    {id: 'Imgvideo', name: 'Expression Images & Video', cost: 70, img: '/icon/expression-video-update.svg', desc: 'Expression images & video allows users to upload a single image and generate both expression images and an expression video based on that image.', link: '/Service/expressions-5-images-20sec-video'},
    {id: 'Imagination', name: 'Popcorn on Steroids', cost: 100, img: '/icon/popcorn-on-steroids-update.svg', desc: 'Popcorn on Steroids allows users to upload a single image and generate a Popcorn on Steroids video and images based on that image.', link: '/Service/popcorn-on-steroids'}
  ]

  return (
    <div className="container mx-auto pt-30 md:pt-50 pb-10 md:pb-30 px-5 app-section">
      <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">AI Applications</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {apps.map(app => (
          <div key={app.id} className="service-box">
             <Image src={app.img} alt={app.name} width={60} height={60} className="w-16 h-16 mb-4"/>
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