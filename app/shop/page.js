export default function Shop() {
  return (
    <div className="max-w-6xl mx-auto pt-32 px-5 pb-20">
      <h1 className="text-4xl font-bold text-center mb-4">Top Up Credits</h1>
      <p className="text-center text-slate-500 mb-16">Secure payment via Stripe</p>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Starter Pack */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-xl transition text-center">
          <h3 className="text-blue-600 font-bold text-xl mb-2">Starter Pack</h3>
          <div className="text-5xl font-bold mb-2">100</div>
          <div className="text-slate-400 mb-6">Credits</div>
          <div className="text-2xl font-bold mb-8">$9.00</div>
          <a href="https://buy.stripe.com/cNi6oJ2sB1Fp5ITfzggYU02" target="_blank" className="block w-full bg-slate-900 text-white py-3 rounded-full hover:bg-blue-600 transition">Buy Now</a>
        </div>

        {/* Medium Pack */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-600 transform scale-105 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</div>
          <h3 className="text-blue-600 font-bold text-xl mb-2">Medium Pack</h3>
          <div className="text-5xl font-bold mb-2">300</div>
          <div className="text-slate-400 mb-6">Credits</div>
          <div className="text-2xl font-bold mb-8">$25.00</div>
          <a href="https://buy.stripe.com/00waEZgjr97RdblfzggYU03" target="_blank" className="block w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition">Buy Now</a>
        </div>

        {/* Large Pack */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-xl transition text-center">
          <h3 className="text-blue-600 font-bold text-xl mb-2">Large Pack</h3>
          <div className="text-5xl font-bold mb-2">1000</div>
          <div className="text-slate-400 mb-6">Credits</div>
          <div className="text-2xl font-bold mb-8">$79.00</div>
          <a href="https://buy.stripe.com/00waEZc3b5VF8V5cn4gYU04" target="_blank" className="block w-full bg-slate-900 text-white py-3 rounded-full hover:bg-blue-600 transition">Buy Now</a>
        </div>
      </div>
    </div>
  )
}