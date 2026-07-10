from pathlib import Path
s=Path('src/components/ChosenView.tsx').read_text(encoding='utf-8').splitlines()
ln=658
print(repr(s[ln]))
for i,ch in enumerate(s[ln], start=1):
    print(i, ch)
