import cv2

img = cv2.imread(r'D:\cml website\poster.png')
print("Vertical scan at x=1000 (center of poster)")
for y in range(1000, 2200, 20):
    b, g, r = img[y, 1000]
    print(f"y={y:4d}: R={r:3d} G={g:3d} B={b:3d}")

print("\nHorizontal scan at y=1500 (middle of screen)")
for x in range(100, 1900, 20):
    b, g, r = img[1500, x]
    # Only print significant changes or just print them all
    if x % 100 == 0:
        print(f"x={x:4d}: R={r:3d} G={g:3d} B={b:3d}")
