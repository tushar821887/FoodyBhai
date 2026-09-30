with open("src/app/components/cart/cart.css", "r") as f:
    content = f.read()

content = content.replace("height: 100vh;", "height: 100dvh; /* dynamic viewport height for mobile */\n  height: 100vh;")

# Add CSS to prevent text overflow in items
items_css = """
.item-info {
  flex-grow: 1;
  padding-right: 0.5rem;
  overflow: hidden;
}

.item-title {
  font-size: 1.05rem;
  margin: 0 0 0.2rem 0;
  color: var(--secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
"""

content = content.replace(".item-info {\n  flex-grow: 1;\n  padding-right: 1rem;\n}", items_css.strip())
content = content.replace(".item-title {\n  font-size: 1.1rem;\n  margin: 0 0 0.5rem 0;\n  color: var(--secondary-color);\n}", "") # removed the old one since we added it in items_css above

with open("src/app/components/cart/cart.css", "w") as f:
    f.write(content)
