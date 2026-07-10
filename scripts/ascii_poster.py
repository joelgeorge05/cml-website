import cv2

img = cv2.imread(r'D:\cml website\poster.png')
# Crop to the laptop area roughly: y=900:1800, x=400:1600
roi = img[900:1800, 400:1600]

# Resize down to e.g. 60x40 to print as ASCII
roi_small = cv2.resize(roi, (60, 45))
gray = cv2.cvtColor(roi_small, cv2.COLOR_BGR2GRAY)

chars = "@%#*+=-:. "
for y in range(45):
    line = ""
    for x in range(60):
        val = gray[y, x]
        idx = int((val / 255.0) * (len(chars) - 1))
        line += chars[idx]
    print(line)
