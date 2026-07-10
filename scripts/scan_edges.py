import cv2

img = cv2.imread(r'D:\cml website\poster.png')
bg_color = (242, 249, 252) # BGR
def is_bg(b, g, r):
    return abs(int(b)-242) < 15 and abs(int(g)-249) < 15 and abs(int(r)-252) < 15

print("Scanning horizontal at y=1500")
left = 0
for x in range(100, 1900):
    b, g, r = img[1500, x]
    if not is_bg(b, g, r) and left == 0:
        left = x
        print(f"Left edge starts at x={x} (RGB: {r},{g},{b})")
    
right = 1900
for x in range(1900, 100, -1):
    b, g, r = img[1500, x]
    if not is_bg(b, g, r) and right == 1900:
        right = x
        print(f"Right edge ends at x={x} (RGB: {r},{g},{b})")

print("\nScanning vertical at x=1000")
top = 0
for y in range(800, 2200):
    b, g, r = img[y, 1000]
    if not is_bg(b, g, r) and top == 0:
        top = y
        print(f"Top edge starts at y={y} (RGB: {r},{g},{b})")

bottom = 2200
for y in range(2200, 800, -1):
    b, g, r = img[y, 1000]
    if not is_bg(b, g, r) and bottom == 2200:
        bottom = y
        print(f"Bottom edge ends at y={y} (RGB: {r},{g},{b})")
