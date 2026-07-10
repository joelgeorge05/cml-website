import cv2
import numpy as np

img = cv2.imread(r'D:\cml website\poster.png')
print("Finding black bezel...")
# We look for pixels where R,G,B are all < 50
dark = (img[:,:,0] < 50) & (img[:,:,1] < 50) & (img[:,:,2] < 50)
y_coords, x_coords = np.where(dark)

if len(y_coords) > 0:
    print(f"Top bezel around y={np.min(y_coords)}")
    print(f"Bottom bezel around y={np.max(y_coords)}")
    print(f"Left bezel around x={np.min(x_coords)}")
    print(f"Right bezel around x={np.max(x_coords)}")
    
    # To be more robust, find the bounding box of the largest dark component
    dark_uint8 = dark.astype(np.uint8) * 255
    contours, _ = cv2.findContours(dark_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)
    print(f"\nLargest dark box (bezel): x={x}, y={y}, w={w}, h={h}")
    print(f"Inner screen approx: x={x+20}, y={y+20}, w={w-40}, h={h-40}")
else:
    print("No dark pixels found.")
