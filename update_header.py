with open("src/app/components/header/header.html", "r") as f:
    content = f.read()

marquee = """<header class="header" [class.scrolled]="isScrolled">
  <div class="top-marquee">
    <div class="marquee-content">
      <span>🎉 Special Offer! Get <strong>20% OFF</strong> on all orders today! Use code <strong>FOODY20</strong> at checkout! 🎉</span>
      <span>🎉 Special Offer! Get <strong>20% OFF</strong> on all orders today! Use code <strong>FOODY20</strong> at checkout! 🎉</span>
      <span>🎉 Special Offer! Get <strong>20% OFF</strong> on all orders today! Use code <strong>FOODY20</strong> at checkout! 🎉</span>
      <span>🎉 Special Offer! Get <strong>20% OFF</strong> on all orders today! Use code <strong>FOODY20</strong> at checkout! 🎉</span>
    </div>
  </div>
"""

content = content.replace('<header class="header" [class.scrolled]="isScrolled">', marquee)

with open("src/app/components/header/header.html", "w") as f:
    f.write(content)
