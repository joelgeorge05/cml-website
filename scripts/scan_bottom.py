import cv2
img = cv2.imread(r'D:\cml website\poster.png')
for y in range(1680, 1900, 2):
    b, g, r = img[y, 1000]
    if r != 252 or g != 249 or b != 242:
        print(f"y={y:4d}: R={r:3d} G={g:3d} B={b:3d}")
        break
