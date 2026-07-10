from pathlib import Path
path = Path('src/components/ChosenView.tsx')
lines = path.read_text(encoding='utf-8').splitlines()
for i in range(180, 210):
    print(f'{i+1}: {lines[i]}')
