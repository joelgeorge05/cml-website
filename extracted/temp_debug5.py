from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
path = Path('src/components/ChosenView.tsx')
lines = path.read_text(encoding='utf-8').splitlines()
for i in range(240, 660):
    print(f'{i+1}: {lines[i]}')
