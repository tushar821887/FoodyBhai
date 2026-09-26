with open("src/app/pages/recipe-detail/recipe-detail.html", "r") as f:
    content = f.read()

content = content.replace("['/category', recipe.category | lowercase]", "['/category', getCategorySlug(recipe.category)]")

with open("src/app/pages/recipe-detail/recipe-detail.html", "w") as f:
    f.write(content)
