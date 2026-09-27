with open("src/app/components/header/header.html", "r") as f:
    content = f.read()

import re

new_nav = """    <nav class="desktop-nav">
      <ul>
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
        <li><a routerLink="/menu" routerLinkActive="active">Menu</a></li>
        <li><a routerLink="/blog" routerLinkActive="active">Blog</a></li>
        <li><a routerLink="/about" routerLinkActive="active">About</a></li>
        <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
      </ul>
    </nav>"""

content = re.sub(r'    <nav class="desktop-nav">\n      <ul>\n        <li><a routerLink="/" routerLinkActive="active" \[routerLinkActiveOptions\]="{exact: true}">Home</a></li>\n        <li><a routerLink="/menu" routerLinkActive="active">Menu</a></li>\n        <li><a routerLink="/about" routerLinkActive="active">About</a></li>\n        <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>\n      </ul>\n    </nav>', new_nav, content)

new_mobile = """    <nav class="mobile-nav">
      <ul>
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a></li>
        <li><a routerLink="/menu" routerLinkActive="active" (click)="closeMenu()">Menu</a></li>
        <li><a routerLink="/blog" routerLinkActive="active" (click)="closeMenu()">Blog</a></li>
        <li><a routerLink="/about" routerLinkActive="active" (click)="closeMenu()">About</a></li>
        <li><a routerLink="/contact" routerLinkActive="active" (click)="closeMenu()">Contact</a></li>
      </ul>
    </nav>"""

content = re.sub(r'    <nav class="mobile-nav">\n      <ul>\n        <li><a routerLink="/" routerLinkActive="active" \[routerLinkActiveOptions\]="{exact: true}" \(click\)="closeMenu\(\)">Home</a></li>\n        <li><a routerLink="/menu" routerLinkActive="active" \(click\)="closeMenu\(\)">Menu</a></li>\n        <li><a routerLink="/about" routerLinkActive="active" \(click\)="closeMenu\(\)">About</a></li>\n        <li><a routerLink="/contact" routerLinkActive="active" \(click\)="closeMenu\(\)">Contact</a></li>\n      </ul>\n    </nav>', new_mobile, content)

with open("src/app/components/header/header.html", "w") as f:
    f.write(content)
