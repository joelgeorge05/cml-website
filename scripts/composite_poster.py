import cv2

# Load images
poster = cv2.imread(r'D:\cml website\poster.png')
ss = cv2.imread(r'D:\cml website\landing_screenshot.png')

if poster is None or ss is None:
    print("Failed to load images.")
    exit(1)

# Coordinates of the laptop screen
x = 560
y = 1070
w = 889
h = 905

# Resize screenshot to fit exactly
ss_resized = cv2.resize(ss, (w, h))

# Paste onto poster
poster[y:y+h, x:x+w] = ss_resized

# Save output
out_path = r'D:\cml website\poster.png'
cv2.imwrite(out_path, poster)
print(f"Successfully updated poster.png with the new screenshot!")
