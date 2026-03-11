# Remedy Images Guide

This directory contains images for the remedies modal cards. The image structure is organized by remedy type.

## Directory Structure

```
remedies/
├── gemstone/      (Images for gemstones like Emerald, Ruby, Sapphire, etc.)
├── mantra/        (Images for mantras)
├── ritual/        (Images for rituals and pujas)
├── donation/      (Images for donations)
└── fasting/       (Images for fasting)
```

## Naming Convention

Images should be named using the remedy name in lowercase with hyphens replacing spaces.

### Examples:

#### Gemstones
- `emerald.jpg`
- `ruby.jpg`
- `sapphire.jpg`
- `diamond.jpg`
- `pearl.jpg`
- `coral.jpg`
- `opal.jpg`
- `topaz.jpg`
- `amethyst.jpg`
- `citrine.jpg`
- `turquoise.jpg`
- `garnet.jpg`

#### Mantras
- `om-namah-shivaya.jpg`
- `gayatri-mantra.jpg`
- `maha-mrityunjaya.jpg`

#### Rituals & Pujas
- `havan-ritual.jpg`
- `puja-ceremony.jpg`
- `abhisheka.jpg`

#### Donations
- `cow-donation.jpg`
- `food-donation.jpg`
- `gold-donation.jpg`

#### Fasting
- `monday-fast.jpg`
- `friday-fast.jpg`
- `ekadashi-fast.jpg`

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Dimensions**: Recommended 600x400px (minimum 400x300px)
- **Size**: Keep under 200KB for optimal performance
- **Quality**: High resolution for better appearance

## How to Add Images

1. Navigate to the appropriate remedy type folder
2. Place the image file with the correct name (following the naming convention)
3. The modal will automatically display the image when a remedy is selected
4. If the image file doesn't exist, the modal will still work and hide the image section gracefully

## Example Image Paths

```
public/images/remedies/gemstone/emerald.jpg
public/images/remedies/mantra/om-namah-shivaya.jpg
public/images/remedies/ritual/havan-ritual.jpg
public/images/remedies/donation/cow-donation.jpg
public/images/remedies/fasting/monday-fast.jpg
```

## Implementation Notes

- Images are optional - the remedies will work fine without them
- The `onError` handler ensures that if an image fails to load, it gracefully hides
- Images are displayed at the top of the modal card with a beautiful gradient overlay
- The image section has a fixed height of 300px with proper aspect ratio handling
