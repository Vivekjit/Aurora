from PIL import Image, ImageEnhance
import os

def extract_aurora_colors(image_path: str) -> list[str]:
    """
    Opens an image, boosts its saturation/brightness, and extracts 2 dominant colors.
    Returns a list of Hex strings: ['#RRGGBB', '#RRGGBB']
    """
    try:
        # 1. Load and drastic resize (Speed hack: processing 50x50 is 100x faster than HD)
        img = Image.open(image_path)
        img = img.convert("RGB")
        img = img.resize((50, 50))

        # 2. Boost Saturation (Essential for the "Breathing Glow" effect)
        # We want vivid colors, not dull grays.
        converter = ImageEnhance.Color(img)
        img = converter.enhance(2.0) # Double the saturation

        # 3. Quantize to reduce to top 3 dominant colors
        result = img.quantize(colors=3)
        palette = result.getpalette()[:9] # Get RGB of top 3 colors

        hex_colors = []
        for i in range(0, len(palette), 3):
            r, g, b = palette[i], palette[i+1], palette[i+2]
            
            # Brightness Floor: If a color is too dark (pitch black), brighten it up
            # This ensures the glow effect is always visible against the black background
            if r+g+b < 50:
                r, g, b = min(255, r+60), min(255, g+60), min(255, b+60)
                
            hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")

        # Return top 2 distinct colors (fallback to Cyan/Purple if extraction fails)
        return hex_colors[:2] if len(hex_colors) >= 2 else ["#0ea5e9", "#8b5cf6"]

    except Exception as e:
        print(f"⚠️ Color Extraction Failed: {e}")
        return ["#0ea5e9", "#8b5cf6"] # Default Aurora Colors
