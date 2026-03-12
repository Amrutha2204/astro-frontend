# Calendar Images Guide

This directory contains images for the calendar page to enhance the visual appearance.

## Directory Structure

```
calendar/
├── sunrise/
│   └── sunrise.jpg (recommended: 300x200px, landscape orientation)
└── moonrise/
    └── moonrise.jpg (recommended: 300x200px, landscape orientation)
```

## Image Specifications

### Sunrise Image (`sunrise/sunrise.jpg`)
- **Size**: 300x200px minimum (larger images will be scaled)
- **Content**: Beautiful sunrise scenes, landscapes with sunrise, golden hour scenes
- **Format**: JPG recommended for better compression
- **Aspect Ratio**: 1.5:1 (landscape)
- **Quality**: High quality, vibrant colors

### Moonrise Image (`moonrise/moonrise.jpg`)
- **Size**: 300x200px minimum (larger images will be scaled)
- **Content**: Beautiful moonrise scenes, night sky, moon landscapes
- **Format**: JPG recommended for better compression
- **Aspect Ratio**: 1.5:1 (landscape)
- **Quality**: High quality, clear night sky imagery

## How to Add Images

1. Place your sunrise image in `public/images/calendar/sunrise/sunrise.jpg`
2. Place your moonrise image in `public/images/calendar/moonrise/moonrise.jpg`
3. Restart your development server
4. Hard refresh your browser (Ctrl+Shift+R)

## Fallback Behavior

If images are not found:
- The cards will display without the images
- The golden gradient background will still show (for sunrise)
- The icons and time text will remain visible
- The page will continue to function normally

## Styling

The images are displayed with:
- Rounded corners (16px border radius)
- Smooth hover effects with scale and shadow transitions
- Gradient overlays for better text readability
- Responsive grid layout

## Optional Enhancement

You can add multiple images and use them as a rotation if desired, but the current setup uses single images for simplicity.
