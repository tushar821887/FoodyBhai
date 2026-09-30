with open("src/app/services/recipe.service.ts", "r") as f:
    content = f.read()

new_categories = """  getCategories(): {name: string, slug: string, description: string, icon: string}[] {
    return [
    {
        "name": "Main Course",
        "slug": "main-course",
        "description": "Delicious Main Course options from Foody Bhai.",
        "icon": "fa-solid fa-bowl-food"
    },
    {
        "name": "Puri & Sabzi",
        "slug": "puri-sabzi",
        "description": "Delicious Puri & Sabzi options from Foody Bhai.",
        "icon": "fa-solid fa-bread-slice"
    },
    {
        "name": "Rice",
        "slug": "rice",
        "description": "Delicious Rice options from Foody Bhai.",
        "icon": "fa-solid fa-bowl-rice"
    },
    {
        "name": "Everyday Essentials",
        "slug": "everyday-essentials",
        "description": "Delicious Everyday Essentials options from Foody Bhai.",
        "icon": "fa-solid fa-basket-shopping"
    },
    {
        "name": "Snacks",
        "slug": "snacks",
        "description": "Delicious Snacks options from Foody Bhai.",
        "icon": "fa-solid fa-cookie-bite"
    },
    {
        "name": "Fresh Salad",
        "slug": "fresh-salad",
        "description": "Delicious Fresh Salad options from Foody Bhai.",
        "icon": "fa-solid fa-leaf"
    },
    {
        "name": "Raita And Sides",
        "slug": "raita-and-sides",
        "description": "Delicious Raita And Sides options from Foody Bhai.",
        "icon": "fa-solid fa-spoon"
    },
    {
        "name": "Drinks & Beverages",
        "slug": "drinks-beverages",
        "description": "Delicious Drinks & Beverages options from Foody Bhai.",
        "icon": "fa-solid fa-mug-hot"
    },
    {
        "name": "Special Combos",
        "slug": "special-combos",
        "description": "Delicious Special Combos options from Foody Bhai.",
        "icon": "fa-solid fa-boxes-stacked"
    },
    {
        "name": "Thalis And Mini Meals",
        "slug": "thalis-and-mini-meals",
        "description": "Delicious Thalis And Mini Meals options from Foody Bhai.",
        "icon": "fa-solid fa-utensils"
    }
];
  }"""

import re
content = re.sub(r'  getCategories\(\): \{name: string, slug: string, description: string\}\[\] \{\n    return \[.*?\];\n  \}', new_categories, content, flags=re.DOTALL)

with open("src/app/services/recipe.service.ts", "w") as f:
    f.write(content)
