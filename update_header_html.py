with open("src/app/components/header/header.html", "r") as f:
    content = f.read()

content = content.replace('<div class="container header-container">', '<div class="header-inner">\n    <div class="container header-container">')
content = content.replace('    </div>\n  </div>\n</header>', '    </div>\n  </div>\n  </div>\n</header>')

with open("src/app/components/header/header.html", "w") as f:
    f.write(content)
