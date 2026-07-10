import cv2
import numpy as np

img = cv2.imread(r'D:\cml website\poster.png')
# Search region for the laptop
roi = img[800:2000, 500:1900]

# Bezel is blackish
gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY_INV)

# Find contours in the inverted threshold (black becomes white)
contours, _ = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

best_rect = None
max_area = 0

for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    area = w * h
    if area > 100000:  # Large enough to be the screen
        # The screen's inner aspect ratio is usually around 1.5 to 1.7
        aspect = float(w)/h
        if 1.4 < aspect < 1.8:
            if area > max_area:
                max_area = area
                best_rect = (x, y, w, h)

if best_rect:
    x, y, w, h = best_rect
    # These coordinates are relative to ROI
    global_x = x + 500
    global_y = y + 800
    print(f"Found laptop inner screen approx: x={global_x}, y={global_y}, w={w}, h={h}")
    
    # We want to paste the screenshot here.
    # But wait, is it the inner screen or outer bezel?
    # Since we inverted, the black bezel is white, so the bounding box is the outer bezel.
    # To find the INNER screen, we can look at the hierarchy or just guess the bezel width.
    
    # Let's save a test image with a red rectangle to verify
    img_test = img.copy()
    cv2.rectangle(img_test, (global_x, global_y), (global_x+w, global_y+h), (0, 0, 255), 3)
    cv2.imwrite(r'C:\Users\Acer\.gemini\antigravity\brain\3acdb68f-4f4c-4559-9d1a-0a0e231ca262\test_bezel.png', img_test)
    print("Saved test_bezel.png")
else:
    print("Failed to find bezel.")
