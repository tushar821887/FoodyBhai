with open("src/app/components/header/header.css", "r") as f:
    content = f.read()

import re

# Fix marquee positioning
content = content.replace("position: absolute;\n  top: 0;\n  left: 0;", "position: relative;")
content = content.replace("  z-index: 1001;\n  display: flex;", "  display: flex;")
# Remove the weird calc paddings that compensate for the absolute positioning
content = re.sub(r'\.header \{\n  padding: calc\(1\.5rem \+ 34px\) 0 1\.5rem 0;\n\}', '.header {\n  padding: 1.5rem 0;\n}', content)
content = re.sub(r'\.header\.scrolled \{\n  padding: calc\(1\.rem \+ 34px\) 0 1rem 0;\n\}', '.header.scrolled {\n  padding: 1rem 0;\n}', content)
content = content.replace("padding: calc(1rem + 34px) 0 1rem 0;", "padding: 1rem 0;")

# We need to ensure the .header still has its base padding since we overwrote it.
# Actually, the base padding was moved to the bottom of the file in my previous script.
# Let's clean up the whole bottom section.

new_bottom = """/* Marquee Styles */
.top-marquee {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 0;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
}

.marquee-content {
  display: flex;
  animation: marquee 20s linear infinite;
}

.marquee-content span {
  padding: 0 4rem;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Base header padding since marquee is now relative */
.header {
  padding: 0; /* Removing padding here, will add padding to container */
}

.header-inner {
  padding: 1.5rem 0;
  transition: padding var(--transition-normal);
}

.header.scrolled .header-inner {
  padding: 1rem 0;
}
"""

content = re.sub(r'/\* Marquee Styles \*/.*', new_bottom, content, flags=re.DOTALL)

with open("src/app/components/header/header.css", "w") as f:
    f.write(content)
