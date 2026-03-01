import os
import re

def process_file(html_file, css_file, js_file):
    if not os.path.exists(html_file):
        print(f"File not found: {html_file}")
        return

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract Style
    style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL | re.IGNORECASE)
    style_match = style_pattern.search(content)
    if style_match:
        css_content = style_match.group(1).strip()
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(css_content)
        content = style_pattern.sub(f'<link rel="stylesheet" href="{os.path.basename(css_file)}">', content)
        print(f"Extracted CSS to {css_file}")

    # Extract Script
    script_pattern = re.compile(r'<script type="module">(.*?)</script>', re.DOTALL | re.IGNORECASE)
    script_match = script_pattern.search(content)
    if script_match:
        js_content = script_match.group(1).strip()
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        content = script_pattern.sub(f'<script type="module" src="{os.path.basename(js_file)}"></script>', content)
        print(f"Extracted JS to {js_file}")

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {html_file}")

if __name__ == "__main__":
    # Nos situamos en la misma carpeta que este script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Procesar farm.html
    process_file(
        os.path.join(base_dir, "farm.html"),
        os.path.join(base_dir, "farm_style.css"),
        os.path.join(base_dir, "farm_script.js")
    )
    
    # Procesar farmgames.html
    process_file(
        os.path.join(base_dir, "farmgames.html"),
        os.path.join(base_dir, "farmgames_style.css"),
        os.path.join(base_dir, "farmgames_script.js")
    )
    print("¡Finalizado! Todos los archivos CSS y JS han sido separados con éxito.")
