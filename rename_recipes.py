import os
import glob

replacements = {
    'routerLink="/recipes"': 'routerLink="/menu"',
    ">Recipes<": ">Menu<",
    "Our <span>Recipes</span>": "Our <span>Menu</span>",
    "Search for recipes...": "Search the menu...",
    "No recipes found!": "No items found!",
    "Browse All Recipes": "Browse Full Menu",
    "Browse Recipes": "Browse Menu",
    "Recipes <span>Menu</span>": "Our <span>Menu</span>",
    "Explore our wide variety of delicious, easy-to-follow recipes.": "Explore our delicious, freshly prepared meals.",
    "path: 'recipes'": "path: 'menu'",
    "> Recipes <": "> Menu <"
}

files = glob.glob('src/app/**/*.html', recursive=True) + glob.glob('src/app/**/*.ts', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")

