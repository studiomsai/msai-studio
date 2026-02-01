export default function Privacy() {
  return (
    <div className="container mx-auto pt-50 pb-30 px-5">
      <div className="max-w-4xl mx-auto glossy-box">
        <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">
          Privacy Policy
        </h1>

        <p className="text-center text-lg mb-10">
          <strong>MSAI Studio</strong> respects your privacy. This policy explains how we handle your data when you use our AI creative platform.
        </p>

        <div className="rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Account Information:</strong> When you register, we collect your name and email address to create your account and manage your credit balance.
            </li>
            <li className="mb-2">
              <strong>User Content:</strong> We collect the text descriptions and portrait images you upload to perform the AI generation services.
            </li>
            <li className="mb-2">
              <strong>Generated Content:</strong> We store your recently generated photos and videos to display them in your account history.
            </li>
            <li className="mb-2">
              <strong>Transaction Data:</strong> We record your purchase history (date and amount of credits bought). Note: We do not store your full credit card details; these are processed securely by Stripe.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Service Delivery:</strong> To process your uploaded portraits and text into videos or photos.
            </li>
            <li className="mb-2">
              <strong>Account Management:</strong> To track your credit usage and display your file history.
            </li>
            <li className="mb-2">
              <strong>Communication:</strong> To send you transaction receipts or critical service updates.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">3. Data Storage and Retention</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Input Images:</strong> Images uploaded for processing are temporarily stored to complete the generation job.
            </li>
            <li className="mb-2">
              <strong>Output History:</strong> We store your generated files in your personal account history for your convenience. You may delete these files at any time via your dashboard.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">4. Third-Party Sharing</h2>
          <p className="mb-6">
            We do not sell your personal data. We share data only with essential service providers:
          </p>

          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Stripe:</strong> For processing credit purchases.
            </li>
            <li className="mb-2">
              <strong>Cloud/AI Providers:</strong> We may use third-party GPU cloud providers or AI APIs to process your requests. These providers are bound by confidentiality agreements and do not use your data to train their public models.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-6">
            Depending on your location, you may have the right to:
          </p>

          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">Access the personal data we hold about you.</li>
            <li className="mb-2">Request the deletion of your account and associated data (including history and credits).</li>
            <li className="mb-2">Download your generated content.</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-6">
            For privacy concerns or to exercise your rights, please contact us at:{" "}
            <a href="mailto:info@msai.studio" className="underline">
              info@msai.studio
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
