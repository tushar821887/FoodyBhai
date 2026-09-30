with open("src/app/pages/recipe-detail/recipe-detail.ts", "r") as f:
    content = f.read()

import re

new_methods = """
  addToCart() {
    if (this.recipe) {
      this.cartService.addToCart(this.recipe);
    }
  }

  getCategorySlug(categoryName: string): string {
    if (!categoryName) return '';
    return categoryName.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-');
  }
"""

content = content.replace("""
  addToCart() {
    if (this.recipe) {
      this.cartService.addToCart(this.recipe);
    }
  }
""", new_methods)

with open("src/app/pages/recipe-detail/recipe-detail.ts", "w") as f:
    f.write(content)
