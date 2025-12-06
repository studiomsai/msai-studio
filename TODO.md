# TODO: Resolve Vercel Deployment Warnings

## Tasks to Complete

- [x] Update app/dashboard/page.js
  - [x] Import { Image } from 'next/image'
  - [x] Replace <img> for preview with <Image> component
  - [x] Replace <img> for generated image with <Image> component
  - [x] Change handleFileChange parameter from (e) to (event)

- [x] Update app/login/page.js
  - [x] Remove unused 'data' variable from signUp destructuring

- [x] Update app/thank-you/page.js
  - [x] Change catch (err) to catch (_err) to suppress unused variable warning

## Followup Steps
- [ ] Run build or lint check to verify warnings are resolved
- [ ] Test application functionality
