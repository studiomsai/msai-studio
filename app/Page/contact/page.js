'use client'

import { useState } from 'react'

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

    // Basic validation
    if (!formData.name || !formData.email || !formData.comments) {
      setSubmitMessage('Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setSubmitMessage('Please enter a valid email address.')
      setIsSubmitting(false)
      return
    }

    // Simulate form submission (replace with actual API call)
    try {
      // Here you would typically send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setSubmitMessage('Thank you for your message! We\'ll get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        comments: ''
      })
    } catch (error) {
      setSubmitMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-30 px-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">Contact Us</h1>
        <p className="text-center text-lg mb-16">Have questions or need help? Get in touch with our team.</p>

        <div className="bg-[#121212] rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-400 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-[#00C0FF] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-400 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-[#00C0FF] focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2 text-white">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-400 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-[#00C0FF] focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-2 text-white">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-400 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-[#00C0FF] focus:border-transparent"
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium mb-2 text-white">
                Comments *
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-400 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-[#00C0FF] focus:border-transparent resize-vertical"
                placeholder="Tell us how we can help you..."
              />
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-lg ${submitMessage.includes('Thank you') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                {submitMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full primary-btn text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121212] rounded-lg p-6">
              <h3 className="font-semibold mb-2 text-[#00C0FF]">Email</h3>
              <p className="text-gray-300">support@msai.studio</p>
            </div>
            <div className="bg-[#121212] rounded-lg p-6">
              <h3 className="font-semibold mb-2 text-[#00C0FF]">Response Time</h3>
              <p className="text-gray-300">Within 24 hours</p>
            </div>
            <div className="bg-[#121212] rounded-lg p-6">
              <h3 className="font-semibold mb-2 text-[#00C0FF]">Support Hours</h3>
              <p className="text-gray-300">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
