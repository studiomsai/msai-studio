'use client'

import { useState } from 'react'
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
    <div className="container mx-auto pt-50 pb-30 px-5">
      <div className="max-w-2xl mx-auto glossy-box">

        <div className="rounded-lg shadow-lg">
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
