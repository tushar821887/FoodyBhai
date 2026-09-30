with open("src/app/pages/home/home.ts", "r") as f:
    content = f.read()

content = content.replace("categories: {name: string, slug: string, description: string}[] = [];", "categories: {name: string, slug: string, description: string, icon?: string}[] = [];")

with open("src/app/pages/home/home.ts", "w") as f:
    f.write(content)
