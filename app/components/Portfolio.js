import Image from "next/image";

export default function Portfolio() {
  const portfolioItems = [
    {
      id: 1,
      title: "Dual Selfie",
      inputs: [
        { label: "Person 1", src: "/image/portfolio/dual-selfie/elon_musk_portrait.jpg" },
        { label: "Person 2", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" },
      ],
      results: [
        { type: "image", src: "/image/portfolio/dual-selfie/dual-selfie-result.jpg" }
      ],
      details: {
        type: "list",
        content: "Dual Selfie allows users to upload two different images and automatically merge them into one single, professionally styled selfie image.",
        items: [
          "Upload two clear photos of different people",
          "System validates image quality and detects faces",
          "Both images are merged into one natural-looking selfie",
          "Preview, download, or regenerate the final image"
        ]
      },
    },
   {
      id: 2,
      title: "Your Mood Today",
      inputs: [
        { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
        { type: "video", src: "/image/portfolio/mood-today/mood-today-result.mp4" },
         { type: "image", src: "/image/portfolio/mood-today/Mood-today-result.png" }
      ],
      details: {
        type: "list",
        content: "Your Mood Today allows users to upload a single image and generate a mood-based styled version of it.",
        items: [
          "Upload two clear photos of different people",
          "System validates image quality and detects faces",
          "Both images are merged into one natural-looking selfie",
          "Preview, download, or regenerate the final image"
        ]
      },
    },
  ];

  // Helper function to render details based on type
  const renderDetails = (details) => {
    if (details.type === "list" && details.items) {
      return (
        <div className="mt-2">
          {details.content && (
            <p className="portfolio-details-text">{details.content}</p>
          )}
          <ul className="portfolio-details-list">
            {details.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <p className="mt-2 portfolio-details-text">
        {details.content}
      </p>
    );
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <h2 className="text-2xl md:text-4xl font-medium text-center mb-10 sub-title">
        Portfolio Showcase
      </h2>

      <div>
        {portfolioItems.map((item) => (
          <div key={item.id}
            className="flex flex-wrap justify-between lg:flex-nowrap gap-10 glossy-box mb-10 portfolio-item"
          >
            {/* LEFT */}
            <div  className="w-full xl:w-[40%]">
              <h3 className="text-3xl font-medium mb-5 sub-title left-title">
                {item.title}
              </h3>

              <p className="mb-3">
                Uploaded Image
              </p>

              <div className="flex flex-wrap gap-6 mb-6 right-arrow">
                {item.inputs.map((input, index) => (
                  <div key={index}>
                    <p className="mb-2 text-[#aeaeae]">
                      {input.label}
                    </p>

                    <div className="relative rounded-lg overflow-hidden border border-[#ffffff1a] portfolio-image">
                      <Image
                        src={input.src}
                        alt={input.label}
                        width={300}
                        height={300}
                        unoptimized
                      />
                    </div>
                  </div>
                ))}

                {renderDetails(item.details)}
              </div>
            </div>

            {/* RIGHT */}
            <div className="w-full xl:w-[50%]">
              <p className="mb-2 text-[#aeaeae]">Result</p>

              <div className="relative overflow-hidden rounded-xl result-slider">
                {item.results && item.results.map((result, index) => (
                  <div key={index} className="mb-4 border border-[#ffffff1a] rounded-xl">
                    {result.type === "image" && (
                      <Image
                        src={result.src}
                        alt="Generated Result"
                        width={700}
                        height={460}
                        className="w-full portfolio-generate-image object-cover rounded-xl"
                        unoptimized
                      />
                    )}

                    {result.type === "video" && (
                      <video
                        src={result.src}
                        controls
                        className="w-full portfolio-generate-image object-cover rounded-xl"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
