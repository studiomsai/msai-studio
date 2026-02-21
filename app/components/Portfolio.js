import Image from "next/image";
import ResultSlider from './ResultSlider';

export default function Portfolio() {
  const portfolioItems = [
    {
      id: 1,
      title: "Dual Selfie",
      link: '/Service/dual-selfie',
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
      link: '/Service/your-mood-today',
      inputs: [
        { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
        { type: "video", src: "/image/portfolio/mood-today/mood-today-result.mp4" },
         { type: "image", src: "/image/portfolio/mood-today/mood-today-result.png" }
      ],
      details: {
        type: "list",
        content: "Your Mood Today allows users to upload a single image and generate a mood-based styled version of it.",
        items: [
          "Upload a clear photo of a person",
          "System validates image quality and detects faces",
          "Both images are merged into one natural-looking selfie",
          "Preview, download, or regenerate the final image"
        ]
      },
    },
    {
      id: 3,
      title: "10 Expression Images",
      link: '/Service/10-expression-images',
      inputs: [
        { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-01.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-02.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-03.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-04.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-05.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-06.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-07.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-08.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-09.png" },
         { type: "image", src: "/image/portfolio/10-expression-image/expressions-10-10.png" },
      ],
      details: {
        type: "list",
        content: "10 Expression Images allows users to upload a single image and generate 10 different expression styles of that image.",
        items: [
          "Upload a clear photo of a person",
          "System generates 10 different expression styles",
          "Preview, download, or regenerate any of the generated images"
        ]
      },
    },
    {
      id: 4,
      title: "Caricature Video",
      link: '/Service/caricature-video',
      inputs: [
        { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
          { type: "video", src: "/image/portfolio/caricature-video/caricature-video.mp4" },
         { type: "image", src: "/image/portfolio/caricature-video/caricature-image.png" }
      ],
      details: {
        type: "list",
        content: "caricature video allows users to upload a single image and generate a caricature video and image based on that image.",
        items: [
          "Upload a clear photo of a person",
          "System generates 10 different expression styles",
          "Preview, download, or regenerate any of the generated images"
        ]
      },
    }, 
    {
      id: 5,
      title: "Expression Video",
      link: '/Service/expression-video',
      inputs: [
        { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
          { type: "video", src: "/image/portfolio/expression-video/expression-video.mp4" }
      ],
      details: {
        type: "list",
        content: "Expression video allows users to upload a single image and generate an expression video based on that image.",
        items: [
          "Upload a clear photo of a person",
          "System generates 10 different expression styles",
          "Preview, download, or regenerate any of the generated images"
        ]
      },
    }, 
     {
      id: 6,
      title: "Expression Images & Video",
      link: '/Service/expression-images-video',
      inputs: [
        { label: "Person 1", src: "/image/portfolio/msai_female.png" }
      ],
      results: [
          { type: "video", src: "/image/portfolio/expression-image-video/expression-video.mp4" },
          { type: "image", src: "/image/portfolio/expression-image-video/expression-1.jpg" },
          { type: "image", src: "/image/portfolio/expression-image-video/expression-2.jpg" },
          { type: "image", src: "/image/portfolio/expression-image-video/expression-3.jpg" },
          { type: "image", src: "/image/portfolio/expression-image-video/expression-4.jpg" },
          { type: "image", src: "/image/portfolio/expression-image-video/expression-5.jpg" },
      ],
      details: {
        type: "list",
        content: "Expression images & video allows users to upload a single image and generate both expression images and an expression video based on that image.",
        items: [
          "Upload a clear photo of a person",
          "System generates 10 different expression styles",
          "Preview, download, or regenerate any of the generated images"
        ]
      },
    }, 
    {
      id: 7,
      title: "Popcorn on Steroids",
      link: '/Service/popcorn-on-steroids',
      inputs: [
         { label: "Person 1", src: "/image/portfolio/MSAI-Studio-Female-Model-Black-BG-small.png" }
      ],
      results: [
          { type: "video", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids.mp4" },
          { type: "image", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids01.png" },
          { type: "image", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids02.png" },
          { type: "image", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids03.png" },
          { type: "image", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids04.png" },
          { type: "image", src: "/image/portfolio/popcorn-on-steroids/popcorn-on-steroids05.png" },
      ],
      details: {
        type: "list",
        content: "Popcorn on Steroids allows users to upload a single image and generate a Popcorn on Steroids video and images based on that image.",
        items: [
          "Upload a clear photo of a person",
          "System generates 10 different expression styles",
          "Preview, download, or regenerate any of the generated images"
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
            className="flex flex-wrap justify-between lg:flex-nowrap gap-10 glossy-box mb-30 portfolio-item"
          >
            {/* LEFT */}
            <div  className="w-full xl:w-[45%]">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-medium mb-5 sub-title left-title">
                  {item.title}
                </h3>
                <a href={item.link} className="primary-btn btn-extra-small text-center mb-5">Explore now</a>
              </div>
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

              <div className="relative  rounded-xl result-slider">
                <ResultSlider results={item.results} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
