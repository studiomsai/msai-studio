'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [open, setOpen] = useState(Array(15).fill(false))

  const toggle = (index) => {
    setOpen(prev => prev.map((o, i) => i === index ? !o : o))
  }

  const faqs = [
    {
      question: "1. What is Msai Studio?",
      answer: "Msai Studio is an AI-powered video creation platform that works as an AI video maker and AI image expression tool, helping users create expressive videos and visuals using artificial intelligence."
    },
    {
      question: "2. Is Msai Studio an online AI video maker tool?",
      answer: "Yes, Msai Studio is a fully online AI video maker tool that allows you to create videos directly from your browser without installing any software."
    },
    {
      question: "3. How does Msai Studio work?",
      answer: "Msai Studio works in three simple steps: upload an image, choose an AI service such as image to video AI or AI image expression, and generate your output instantly."
    },
    {
      question: "4. Can I convert images into videos using AI?",
      answer: "Yes, Msai Studio’s image to video AI feature allows you to convert static images into expressive AI-powered videos."
    },
    {
      question: "5. What is AI image expression?",
      answer: "AI image expression uses artificial intelligence to generate realistic facial emotions and movements from a single photo or image."
    },
    {
      question: "6. What types of AI videos can I create with Msai Studio?",
      answer: "You can create AI video animation, expression videos, caricature videos, dual selfie videos, and AI talking photo content."
    },
    {
      question: "7. Is Msai Studio suitable for social media content?",
      answer: "Absolutely. Msai Studio is an AI video maker for social media, ideal for creating reels, shorts, ads, and engaging visual content."
    },
    {
      question: "8. Can businesses use Msai Studio for marketing?",
      answer: "Yes, Msai Studio is an AI video maker for marketing, helping businesses create promotional videos, advertisements, and branded content."
    },
    {
      question: "9. Do I need to purchase credits to use Msai Studio?",
      answer: "Yes, to access advanced features of the AI video maker and AI image expression tool, users need to purchase credits."
    },
    {
      question: "10. What are credits in Msai Studio?",
      answer: "Credits are usage units required to generate AI videos, image expression videos, and other AI-powered outputs on Msai Studio."
    },
    {
      question: "11. Do different services require different credits?",
      answer: "Yes, each service uses different credit amounts depending on the selected feature, such as image to video AI, expression video, or caricature video."
    },
    {
      question: "12. Can I see credit usage before generating a video?",
      answer: "Yes, Msai Studio clearly displays the required credits for each service before you generate the final output."
    },
    {
      question: "13. Is Msai Studio free to use?",
      answer: "Msai Studio may offer limited free credits for testing. Continued use of AI video animation tools requires purchasing credits."
    },
    {
      question: "14. Do credits expire or get refunded?",
      answer: "Credit validity depends on the selected plan. Unused credits are generally non-refundable. Please refer to the terms and conditions for details."
    },
    {
      question: "15. Who should use Msai Studio?",
      answer: "Msai Studio is ideal for content creators, marketers, influencers, and businesses looking for an AI video maker and AI image expression generator online."
    }
  ]

  return (
    <div className="container mx-auto pt-50 pb-30 px-5 px-5">
      <div className="max-w-4xl mx-auto glossy-box">
        <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">
          Frequently Asked Questions (FAQs)
        </h1>
        <p className="text-center text-lg mb-10">
          <strong>Msai Studio</strong> - Your go-to AI video creation platform.
        </p>

        <div className="rounded-lg shadow-lg text-white">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-700">
              <button
                onClick={() => toggle(index)}
                className="w-full text-left flex justify-between items-center py-4 px-4 hover:bg-gray-800/50 transition-colors"
              >
                <h2 className="text-xl font-semibold">{faq.question}</h2>
                <ChevronDown className={`transform transition-transform ${open[index] ? 'rotate-180' : ''}`} />
              </button>
              {open[index] && (
                <div className="px-4 pb-4">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
