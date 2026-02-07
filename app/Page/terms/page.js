export default function Terms() {
  return (
    <div className="container mx-auto pt-50 pb-30 px-5 px-5">
      <div className="max-w-4xl mx-auto glossy-box">
        <h1 className="text-2xl md:text-4xl font-medium text-center mb-6 sub-title">
          Terms & Conditions
        </h1>

        <p className="text-center text-lg mb-10">
          Welcome to <strong>MSAI Studio.</strong> By creating an account or using our services, you agree to these Terms.
        </p>

        <div className="rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-semibold mb-4">1. The Service</h2>
          <p className="mb-6">
            MSAI Studio is a pay-as-you-go AI creative platform. We provide a suite of applications that allow users to upload inputs (such as portrait images or short text descriptions) to generate media outputs, including photos, videos, and UGC-style commercials.
          </p>

          <h2 className="text-xl font-semibold mb-4">2. Accounts and Security</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Registration:</strong> To access the tools, you must create a personal account. You are responsible for maintaining the confidentiality of your login credentials.
            </li>
            <li className="mb-2">
              <strong>History:</strong> Your account will serve as a dashboard to view your available credits, purchase history, and a history of your recent generated files.
            </li>
            <li className="mb-2">
              <strong>Age Requirement:</strong> You must be at least 18 years old to use this platform.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">3. Credits and Payments</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Pay-As-You-Go:</strong> MSAI Studio operates on a credit-only system. We do not charge subscription fees.
            </li>
            <li className="mb-2">
              <strong>Purchasing Credits:</strong> Credits are purchased via our third-party payment processor, Stripe. By purchasing credits, you agree to Stripe’s terms of service.
            </li>
            <li className="mb-2">
              <strong>No Expiration:</strong> Credits purchased on MSAI Studio do not expire and remain in your account until used.
            </li>
            <li className="mb-2">
              <strong>Refunds:</strong> Due to the digital nature of the services and the costs associated with GPU processing, credit purchases are generally non-refundable unless required by local law.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">4. User Content and Permissions</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Your Inputs:</strong> You retain ownership of any images (portraits) or text you upload. By uploading content, you grant MSAI Studio a temporary license to process that content solely for the purpose of generating your requested output.
            </li>
            <li className="mb-2">
              <strong>Rights of Publicity:</strong> You represent and warrant that you own the rights to any face/portrait you upload. You must not upload images of third parties without their explicit consent. Uploading images of celebrities, public figures, or non-consenting individuals is strictly prohibited.
            </li>
            <li className="mb-2">
              <strong>AI Outputs:</strong> Subject to your compliance with these terms, you own the rights to the generated media (photos and videos) created by the platform. You may use them for personal or commercial purposes.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">5. Acceptable Use Policy</h2>
          <p className="mb-6">
            You agree not to use MSAI Studio to generate:
          </p>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">Content that is illegal, defamatory, or promotes violence/hate speech.</li>
            <li className="mb-2">Explicit sexual content (NSFW) or child exploitation material (CSAM).</li>
            <li className="mb-2">Deepfakes intended to deceive, defraud, or harass others.</li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">6. Disclaimers regarding AI</h2>
          <ul className="pl-6 list-disc mb-6">
            <li className="mb-2">
              <strong>Accuracy:</strong> Artificial Intelligence is probabilistic. We cannot guarantee that the generated output will be error-free or perfectly resemble the input subject.
            </li>
            <li className="mb-2">
              <strong>&quot;As Is&quot; Service:</strong> The apps are provided on an &quot;as is&quot; basis. While we aim for professional quality, results depend on the quality of your input data.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="mb-6">
            To the fullest extent permitted by law, MSAI Studio shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or inability to access your account/credits.
          </p>
        </div>
      </div>
    </div>
  )
}
