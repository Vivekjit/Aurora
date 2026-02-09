import os
import cv2
import numpy as np
from moviepy.video.io.VideoFileClip import VideoFileClip 
from PIL import Image, ImageEnhance

def get_dominant_colors(pil_img, num_colors=2):
    """ Helper: Extracts 'num_colors' dominant hex codes from a PIL image """
    try:
        # 1. Boost Saturation (Helps find vibrant colors, ignores greys)
        converter = ImageEnhance.Color(pil_img)
        img = converter.enhance(2.0) 
        
        # 2. Fast Quantization
        img = img.resize((50, 50)) # Speed optimization
        result = img.quantize(colors=5) # Get top 5 palette
        palette = result.getpalette()[:15] # r,g,b, r,g,b...
        
        colors = []
        for i in range(0, len(palette), 3):
            r, g, b = palette[i], palette[i+1], palette[i+2]
            # Skip very dark colors (almost black) to keep the glow alive
            if r+g+b > 40: 
                colors.append(f"#{r:02x}{g:02x}{b:02x}")
        
        # Return requested amount, or pad with fallback
        final = colors[:num_colors]
        while len(final) < num_colors:
            final.append("#000000")
            
        return final
    except:
        return ["#000000"] * num_colors

def process_video_upload(file_path: str):
    """
    Analyzes video spatially: Top 1/3 vs Bottom 1/3
    """
    try:
        clip = VideoFileClip(file_path)
        
        # 1. VALIDATION & COMPRESSION (Keep existing logic)
        if clip.duration > 120:
            clip.close()
            os.remove(file_path) 
            raise ValueError("Video too long.")

        if clip.h > 1080:
            print(f"📉 Compressing video...")
            clip = clip.resized(height=1080)
            new_path = file_path.replace(".", "_1080p.")
            clip.write_videofile(new_path, codec="libx264", audio_codec="aac", preset="fast")
            clip.close()
            os.remove(file_path)
            file_path = new_path
            clip = VideoFileClip(file_path)

        # 2. SPATIAL COLOR TIMELINE
        timeline = []
        duration = int(clip.duration)
        step = 5 
        
        # Calculate split points
        h, w = clip.h, clip.w
        split_h = h // 3

        print(f"🎨 Extracting Spatial Colors (Top/Bottom)...")
        
        for t in range(0, duration + 1, step):
            frame_np = clip.get_frame(t)
            
            # Convert to PIL
            full_img = Image.fromarray(frame_np)
            
            # CROP: Top Third & Bottom Third
            # box = (left, upper, right, lower)
            top_img = full_img.crop((0, 0, w, split_h))
            bottom_img = full_img.crop((0, h - split_h, w, h))
            
            # EXTRACT
            top_colors = get_dominant_colors(top_img, 2)
            bottom_colors = get_dominant_colors(bottom_img, 2)
            
            timeline.append({
                "timestamp": t,
                "top": top_colors,
                "bottom": bottom_colors
            })

        clip.close()
        return {
            "path": file_path,
            "timeline": timeline
        }

    except Exception as e:
        print(f"❌ Video Processing Error: {e}")
        # Fallback structure
        return {
            "path": file_path,
            "timeline": [{
                "timestamp": 0, 
                "top": ["#0ea5e9", "#8b5cf6"], 
                "bottom": ["#000000", "#1a1a1a"]
            }]
        }
