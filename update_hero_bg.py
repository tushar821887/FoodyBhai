with open("src/app/components/hero/hero.css", "r") as f:
    content = f.read()

import re
content = re.sub(
    r'background: linear-gradient\(.*?\);',
    'background: #fcf2ec;',
    content
)

with open("src/app/components/hero/hero.css", "w") as f:
    f.write(content)

with open("src/app/components/header/header.css", "r") as f:
    header_css = f.read()

header_css = header_css.replace("background: transparent;", "background: #fcf2ec;")
with open("src/app/components/header/header.css", "w") as f:
    f.write(header_css)
