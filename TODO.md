# Task: Make all service pages match the design of the dual selfie page

## Overview
Update all service pages (caricature-video, 10expression, expression-video, expressions-5-images-20sec-video, mood-today, popcorn-on-steroids) to match the layout and styling of the dual-selfie page.

## Key Changes to Apply
- Title: Change `mb-16` to `mb-8` and add `mt-30`
- Credits display: Wrap credit value in `<span className="text-green-500">`
- Note: Wrap credit requirement in `<span className="text-green-500">`
- File input: Standardize to use wrapper with label (for single image pages)
- Button: Change class to `primary-btn generate-button`
- Results: Move results section outside `dashboard-card` into a new `result-section` div with loader when no result
- Ensure consistent structure across all pages

## Pages to Update
- [ ] app/Service/caricature-video/page.js
- [ ] app/Service/10expression/page.js
- [ ] app/Service/expression-video/page.js
- [ ] app/Service/expressions-5-images-20sec-video/page.js
- [ ] app/Service/mood-today/page.js
- [ ] app/Service/popcorn-on-steroids/page.js

## Implementation Steps
1. Update title styling
2. Update credits and note display
3. Standardize file input structure
4. Update button class
5. Restructure results section with loader
6. Test each page for consistency
