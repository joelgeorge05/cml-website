import cv2

img_path = r'D:\cml website\poster.png'
img = cv2.imread(img_path)
if img is None:
    print("Could not read image")
    exit(1)

h, w = img.shape[:2]
print(f"Image size: {w}x{h}")

# Draw grid lines every 100 pixels
for x in range(0, w, 100):
    cv2.line(img, (x, 0), (x, h), (0, 255, 0), 2)
    cv2.putText(img, str(x), (x+5, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.putText(img, str(x), (x+5, h-50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

for y in range(0, h, 100):
    cv2.line(img, (0, y), (w, y), (0, 255, 0), 2)
    cv2.putText(img, str(y), (50, y-5), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    cv2.putText(img, str(y), (w-150, y-5), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

out_path = r'C:\Users\Acer\.gemini\antigravity\brain\3acdb68f-4f4c-4559-9d1a-0a0e231ca262\grid_poster.png'
cv2.imwrite(out_path, img)
print(f"Saved grid image to {out_path}")
