'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    comments: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    if (!formData.name || !formData.email || !formData.comments) {
      setSubmitMessage('Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitMessage('Please enter a valid email address.')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('contact')
        .insert([
          {
            "name": formData.name,
            "email": formData.email,
            "phone": formData.phone,
            "country": formData.country,
            "comments": formData.comments
          }
        ])

      if (error) throw error

      setSubmitMessage("Thank you for your message! We'll get back to you soon.")
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        comments: ''
      })

    } catch (error) {
      console.error('Supabase Error:', error)
      setSubmitMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto pt-50 pb-30 px-5 px-5">
      <div className="max-w-5xl mx-auto glossy-box flex gap-10">
        <div className="mb-10 w-1/2">
            <h1 className="text-2xl md:text-4xl font-medium mb-8 sub-title left-title">Contact Us</h1>
            <p className='text-justify'>msai.studio, anyone can create amazing AI-powered videos and images no coding, no setup, no experience needed. We make powerful creative tools simple, fun, and affordable for everyone. Each app on msai.studio runs advanced AI workflows in the background while you focus on the result from turning a selfie into cinematic motion to creating full story-based videos or photo shoots in seconds.</p>
            <ul  className="my-4">
              <li className="mb-4"><a href="#" className="flex gap-4 items-center"><Image src="/icon/email.svg" alt="Contact Icon" className='mr-2 w-[40px] h-[40px] p-2 rounded-[100%] contact-icon'  width={24} height={24}/> info@msai.com </a></li>
              <li className="mb-4"><a href="#" className="flex gap-4 items-center"><Image src="/icon/phone.svg" alt="Contact Icon" className='mr-2 w-[40px] h-[40px] p-2 rounded-[100%] contact-icon' width={24} height={24}/> +1 123123123</a></li>
              <li className="mb-4"><a href="#" className="flex gap-4 items-center"><Image src="/icon/map.svg" alt="Contact Icon" className='mr-2 w-[40px] h-[40px] p-2 rounded-[100%] contact-icon' width={24} height={24}/> Office no. 143, Alpha Bazaar, Venus Atlantis Corporate Park, Prahlad Nagar, Ahmedabad, Gujarat, 380015</a></li>
            </ul>
        </div>
        <div className="rounded-lg shadow-lg w-1/2">
          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
              className="w-full px-4 py-3 border border-[#3a3a3a] bg-transparent text-white rounded-lg"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="w-full px-4 py-3 border border-[#3a3a3a] bg-transparent text-white rounded-lg"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full px-4 py-3 border border-[#3a3a3a] bg-transparent text-white rounded-lg"
            />

            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[#3a3a3a] bg-transparent text-white rounded-lg"
            >
              <option value="">Select Country</option>
              <option value="IN">India</option>
              <option value="US">United States</option>
            </select>

            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Comments"
              required
              rows={5}
              className="w-full px-4 py-3 border border-[#3a3a3a] bg-transparent text-white rounded-lg"
            />

            {submitMessage && (
              <div className="text-center p-3 bg-green-100 text-green-800 rounded">
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full primary-btn"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
