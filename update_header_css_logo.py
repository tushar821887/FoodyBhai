with open("src/app/components/header/header.css", "r") as f:
    content = f.read()

content = content.replace("height: 50px;", "height: 55px;")
content = content.replace("height: 60px;", "height: 65px;")

with open("src/app/components/header/header.css", "w") as f:
    f.write(content)
