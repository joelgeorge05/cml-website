import cv2

img = cv2.imread(r'D:\cml website\poster.png')
print("Vertical scan at x=1000 (center of poster)")
for y in range(1010, 1100, 2):
    b, g, r = img[y, 1000]
    print(f"y={y:4d}: R={r:3d} G={g:3d} B={b:3d}")

print("\nHorizontal scan at y=1080 (in the red bar)")
for x in range(550, 650, 2):
    b, g, r = img[1080, x]
    print(f"x={x:4d}: R={r:3d} G={g:3d} B={b:3d}")

for x in range(1350, 1450, 2):
    b, g, r = img[1080, x]
    print(f"x={x:4d}: R={r:3d} G={g:3d} B={b:3d}")

