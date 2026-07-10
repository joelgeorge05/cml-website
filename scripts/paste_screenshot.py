import cv2
import numpy as np

# Load poster and screenshot
poster_path = r'C:\Users\Acer\.gemini\antigravity\brain\3acdb68f-4f4c-4559-9d1a-0a0e231ca262\.tempmediaStorage\media_3acdb68f-4f4c-4559-9d1a-0a0e231ca262_1783360148578.png'
ss_path = r'D:\cml website\landing_screenshot.png'
out_path = r'C:\Users\Acer\.gemini\antigravity\brain\3acdb68f-4f4c-4559-9d1a-0a0e231ca262\poster_updated.png'

poster = cv2.imread(poster_path)
ss = cv2.imread(ss_path)

if poster is None or ss is None:
    print("Error loading images")
    exit(1)

# Convert poster to grayscale for edge detection
gray = cv2.cvtColor(poster, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5, 5), 0)
edges = cv2.Canny(blur, 50, 150)

# Find contours
contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

# Find the contour that most closely matches the laptop screen
# We expect a large rectangle in the bottom half of the image
h_img, w_img = poster.shape[:2]

best_rect = None
max_area = 0

for c in contours:
    peri = cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, 0.02 * peri, True)
    
    if len(approx) == 4:
        x, y, w, h = cv2.boundingRect(approx)
        area = w * h
        
        # Laptop screen is large, roughly 16:9 or 16:10, and in the bottom half
        aspect_ratio = float(w) / h
        
        if 1.4 < aspect_ratio < 1.8 and area > 100000 and y > h_img * 0.3:
            if area > max_area:
                max_area = area
                best_rect = (x, y, w, h)
                
if best_rect:
    x, y, w, h = best_rect
    print(f"Found laptop screen at: x={x}, y={y}, w={w}, h={h}")
    
    # Resize screenshot to fit the screen exactly
    ss_resized = cv2.resize(ss, (w, h))
    
    # Paste screenshot onto poster
    poster[y:y+h, x:x+w] = ss_resized
    
    cv2.imwrite(out_path, poster)
    print(f"Saved updated poster to {out_path}")
else:
    print("Could not find the laptop screen automatically.")
