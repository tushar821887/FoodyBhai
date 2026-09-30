with open("src/app/components/hero/hero.html", "r") as f:
    content = f.read()

content = content.replace('href="https://www.swiggy.com/"', 'href="https://www.swiggy.com/city/meerut/foody-bhai-meerut-cantt-rest1404714"')

with open("src/app/components/hero/hero.html", "w") as f:
    f.write(content)
