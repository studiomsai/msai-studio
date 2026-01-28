# TODO: Implement Hover-to-Download for Service Pages

## Overview
Remove download buttons and add hover-to-show download icon on media (images/videos) for direct download on click.

## Tasks
- [x] Update app/Service/10expression/page.js
- [x] Update app/Service/caricature-video/page.js
- [x] Update app/Service/dual-selfie/page.js
- [x] Update app/Service/expression-video/page.js
- [x] Update app/Service/expressions-5-images-20sec-video/page.js
- [x] Update app/Service/mood-today/page.js
- [x] Update app/Service/popcorn-on-steroids/page.js

## Implementation Details
- Remove `<a href="..." download className="download-button">Download ...</a>` elements
- Wrap media in div with relative positioning
- Add download icon SVG on hover (position: absolute, top/right corner)
- Add onClick handler to icon for direct download
- Add CSS classes for hover effects
