import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'About Us - MSAI Studio',
  description: 'Learn about MSAI Studio - AI Creation Simplified. Anyone can create stunning AI-powered videos and images.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-30 md:pt-50 pb-10 md:pb-30 px-5">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10  md:mb-16">
          <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">
            About MSAI Studio
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            AI Creation. Simplified.
          </p>
        </div>

        {/* Introduction Section */}
        <div className="glossy-box mb-8 md:mb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className='order-2 lg:order-1 w-full lg:w-1/2'>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
                AI Creation. Simplified.
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                At msai.studio, anyone can create stunning AI-powered videos and images — no coding,
                no complex setup, no prior experience required.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                We believe powerful creative technology shouldn&apos;t be complicated. That&apos;s why we&apos;ve
                built a platform where advanced AI workflows run seamlessly in the background —
                while you stay focused on what truly matters: your ideas.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                Whether you want to transform a selfie into cinematic motion, generate a professional
                photo shoot, or create a complete story-based video in seconds, msai.studio makes it
                possible — effortlessly.
              </p>
            </div>

            <div className="order-1 lg:order-2 relative w-full lg:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0238b0]/20 to-[#37aeb0]/20 blur-3xl rounded-full"></div>
              <Image
                src="/image/aboutmsai.png"
                alt="AI Creation"
                width={700}
                height={520}
                className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="glossy-box mb-8 md:mb-12">
           <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0238b0]/20 to-[#37aeb0]/20 blur-3xl rounded-full"></div>
              <Image
                src="/image/robortmsai.png"
                alt="Technology"
                width={700}
                height={520}
                className="relative w-full rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>

            <div className="w-full lg:w-1/2">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
                Powerful Technology. Made Accessible.
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                Every app on msai.studio is powered by professional-grade AI systems.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed mb-4">
                But you don&apos;t need to understand the technology behind it.
              </p>
              <p className="text-lg text-slate-300 leading-relaxed">
                You simply choose, upload, click — and create.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
    

        {/* Pricing Section */}
        <div className="glossy-box mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
            No Subscriptions. No Commitment.
          </h2>

          <p className="text-lg text-slate-300 mb-6">
            MSAI Studio operates on a pay-as-you-go basis.
          </p>

          <ul className="space-y-4 mb-6">
            {["No monthly subscriptions", "No locked plans", "No unnecessary commitments"].map(
              (item, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-3 h-3 bg-gradient-to-r from-[#0238b0] to-[#37aeb0] rounded-full mr-4" />
                  <span className="text-lg text-slate-300">{item}</span>
                </li>
              )
            )}
          </ul>

          <p className="text-lg text-slate-300">You only pay for what you use.</p>
          <p className="text-lg text-[#00C0FF] font-medium mt-2">
            Creative freedom should not come with hidden costs.
          </p>
        </div>

        {/* Built for Creators Section */}
        <div className="glossy-box mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
            Built for Creators — Everywhere
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            MSAI Studio is designed for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Content creators',
              'Entrepreneurs',
              'Agencies',
              'Filmmakers',
              'Marketers',
              'Anyone with an idea'
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#37aeb0] transition-all duration-300"
              >
                <span className="w-2 h-2 bg-gradient-to-r from-[#0238b0] to-[#37aeb0] rounded-full mr-3"></span>
                <span className="text-lg text-slate-200">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-lg text-slate-300 leading-relaxed mt-6">
            From personal projects to commercial productions — our tools help you bring concepts to 
            life anytime, anywhere.
          </p>
        </div>

        {/* Ownership & Background Section */}
        <div className="glossy-box mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
            Ownership & Background
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            MSAI Studio is a collaboration between:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* MSAI Personal Design */}
            <a href="#" className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-[#37aeb0] transition-all duration-300">
              <span>
                 <Image src="/image/msaidesign-logo.png" alt="MSAI Studio Logo" className="mb-4" width={100} height={100} />
              </span>
              <h3 className="text-xl font-semibold text-white mb-2">MSAI Personal Design</h3>
              <p className="text-slate-400">Based in The Netherlands</p>
            </a>
            
            {/* Hn9 Codecraft */}
            <a href="https://hn9.io/" target="_black" className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-[#37aeb0] transition-all duration-300">
              <span>
                 <Image src="/image/hn9-white.png" alt="MSAI Studio Logo" className="mb-4" width={200} height={100} />
              </span>
              <h3 className="text-xl font-semibold text-white mb-2">Hn9 Codecraft</h3>
              <p className="text-slate-400">Based in India</p>
            </a>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed mt-8">
            Together, we combine creative direction, AI innovation, and technical engineering to deliver 
            a streamlined creative platform that bridges imagination and execution.
          </p>
        </div>

        {/* Vision Section */}
        <div className="glossy-box mb-8 md:mb-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-5">
                <div className="order-2 lg:order-1 w-full lg:w-1/2">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
                        Our Vision
                    </h2>
                    <p className="text-lg text-slate-300 mb-4">
                    We believe the future of creativity is powered by intelligent tools that help people express ideas faster and better.
                    </p>
                    <p className="text-lg text-slate-300 mb-4">
                    Our vision is to make advanced AI accessible to everyone, not just experts or large teams.
                    </p>
                    <p className="text-lg text-slate-300 mb-4">
                        We want creators to spend less time struggling with complex tools and more time focusing on imagination, storytelling, and impact.
                    </p>
                    <p className="text-lg text-slate-300 mb-4">MSAI Studio aims to become a trusted creative platform where technology works quietly in the background and creativity stays in the spotlight.</p>
                    <p  className="text-xl text-[#00C0FF] font-bold mt-3">
                        We see a future where anyone, anywhere, can turn an idea into professional-quality content within minutes.
                    </p>
                </div>
                <div className="order-1 lg:order-2 w-full lg:w-1/2">
                    <Image src="/image/ourvision.png" alt="MSAI Studio Logo" className="w-full rounded-xl" width={500} height={400} />
                </div>
            </div>
             <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="order-2 w-full lg:w-1/2">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-6 sub-title inline-block left-title">
                        Our Mission
                    </h2>
                    <p className="text-lg text-slate-300 mb-4">
                        Our mission is to make professional AI creation simple, fast, and accessible for everyone. </p>
                    <p className="text-lg text-slate-300 mb-4">
                    We focus on removing technical barriers so creators can easily generate images, videos, and visual content without needing design or technical skills.</p>
                    <p className="text-lg text-slate-300 mb-4">
                    We aim to provide reliable, easy-to-use tools that help individuals, teams, and businesses bring ideas to life with confidence.</p>
                    <p className="text-lg text-slate-300 mb-4">
                    By continuously improving our platform, we strive to support creativity at every level — from beginners to professionals.
                    </p>
                </div>
                <div className="order-1 w-full lg:w-1/2">
                    <Image src="/image/ourmission.png" alt="MSAI Studio Logo" className="w-full rounded-xl" width={500} height={400} />
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pt-8">
          <Link href="/Page/apps" className="primary-btn">
            Explore Our Apps
          </Link>
        </div>
      </div>
    </main>
  );
}
