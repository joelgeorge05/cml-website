import cv2
import numpy as np

# Load poster and logo
poster = cv2.imread(r'D:\cml website\poster.png')
logo = cv2.imread(r'D:\cml website\src\assets\images\logo.png', cv2.IMREAD_UNCHANGED)

# The logo is probably resized in the laptop screen.
# The laptop screen is about 900px wide. A typical 1440px website has the logo at ~50px height.
# So in the 900px wide screen, the logo might be 900/1440 * 50 = ~30px height.
# Let's scale the logo to multiple sizes (20px to 80px) and match template.

if logo.shape[2] == 4:
    # Use alpha channel as mask for better matching
    mask = logo[:, :, 3]
    logo_bgr = logo[:, :, :3]
else:
    logo_bgr = logo
    mask = None

gray_poster = cv2.cvtColor(poster, cv2.COLOR_BGR2GRAY)

best_val = -1
best_loc = None
best_scale = 1.0

# Search only in the laptop area (bottom half)
roi_y_start = 1000
gray_roi = gray_poster[roi_y_start:2200, 400:1800]

for scale in np.linspace(0.1, 0.5, 40):
    w = int(logo_bgr.shape[1] * scale)
    h = int(logo_bgr.shape[0] * scale)
    if w == 0 or h == 0: continue
    resized_logo = cv2.resize(logo_bgr, (w, h))
    gray_logo = cv2.cvtColor(resized_logo, cv2.COLOR_BGR2GRAY)
    
    if mask is not None:
        resized_mask = cv2.resize(mask, (w, h))
        res = cv2.matchTemplate(gray_roi, gray_logo, cv2.TM_CCORR_NORMED, mask=resized_mask)
    else:
        res = cv2.matchTemplate(gray_roi, gray_logo, cv2.TM_CCOEFF_NORMED)
        
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    if max_val > best_val:
        best_val = max_val
        best_loc = max_loc
        best_scale = scale
        best_h, best_w = h, w

print(f"Best match val: {best_val}")
if best_val > 0.8:
    x = best_loc[0] + 400
    y = best_loc[1] + roi_y_start
    print(f"Found logo at x={x}, y={y} with size w={best_w}, h={best_h}")
    # The logo in the header is usually a few pixels from the left and top of the inner screen.
    # We can estimate the laptop screen top-left corner!
    # In the screenshot, the logo is at x ~ 30, y ~ 10 from the inner screen corner (relative to screen).
else:
    print("Could not find the logo in the laptop.")
