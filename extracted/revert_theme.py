import os
import glob

def revert_theme():
    # Target directory
    target_dir = 'src/components'
    tsx_files = glob.glob(os.path.join(target_dir, '*.tsx'))

    for filepath in tsx_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content.replace('violet', 'rose')
        new_content = new_content.replace('bg-[#f5f3ff]', 'bg-[#fdfbfa]')

        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Reverted colors in {filepath}")

if __name__ == '__main__':
    revert_theme()
