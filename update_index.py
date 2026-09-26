with open("src/index.html", "r") as f:
    content = f.read()

import re

new_meta = """  <title>Foody Bhai | Best Online Food Delivery in Meerut | Cloud Kitchen</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Order premium, delicious, and 100% vegetarian food online in Meerut from Foody Bhai. Experience the finest delivery-only kitchen bringing authentic north Indian dishes, thalis, and snacks right to your doorstep.">
  <meta name="keywords" content="Foody Bhai, food delivery Meerut, best restaurants in Meerut, order food online Meerut, pure veg food Meerut, cloud kitchen Meerut, dinner delivery, fast food Meerut, thali delivery Meerut, zomato Meerut, swiggy Meerut, online takeaway, Mohan Puri restaurants">"""

content = re.sub(r'  <title>FoodyBhai - Discover Authentic & Easy Recipes</title>\n  <base href="/">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="FoodyBhai is your go-to destination for authentic, easy-to-follow recipes\. Explore our collection of delicious breakfasts, mains, snacks, and more\.">\n  <meta name="keywords" content="recipes, cooking, authentic recipes, easy recipes, indian recipes, healthy food, meals, foodybhai">', new_meta, content)

with open("src/index.html", "w") as f:
    f.write(content)
