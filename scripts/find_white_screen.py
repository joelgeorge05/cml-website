import cv2
import numpy as np

img = cv2.imread(r'D:\cml website\poster.png')
# Look for the massive white background of the laptop screen inside the bezel
# The inner white is roughly RGB = (242, 249, 252) -> BGR = (252, 249, 242)

# Create a mask for near-white pixels
lower = np.array([240, 240, 240])
upper = np.array([255, 255, 255])
mask = cv2.inRange(img, lower, upper)

# The screen is the largest white rectangle
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
best_rect = None
max_area = 0

for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    area = w * h
    if area > max_area and 100 < x < 1500 and y > 900:
        max_area = area
        best_rect = (x, y, w, h)

print(f"Largest white rect: {best_rect}")

# However, the screen contains images and text, so it's not a single white contour!
# Let's just find the bounding box of ALL white pixels in the bottom half of the image
# But there might be other white things.
# Let's restrict to x=560 to 1450 and y=1060 to 1980 (approx from previous scans)

roi = mask[1060:1980, 560:1450]
y_idx, x_idx = np.where(roi == 255)

if len(y_idx) > 0:
    min_y, max_y = np.min(y_idx), np.max(y_idx)
    min_x, max_x = np.min(x_idx), np.max(x_idx)
    print(f"White bounds inside ROI: x=[{min_x+560}, {max_x+560}], y=[{min_y+1060}, {max_y+1060}]")
    w = max_x - min_x
    h = max_y - min_y
    print(f"Screen width: {w}, height: {h}")

