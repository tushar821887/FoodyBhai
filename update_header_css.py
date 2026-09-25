with open("src/app/components/header/header.css", "r") as f:
    content = f.read()

marquee_css = """
/* Marquee Styles */
.top-marquee {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 8px 0;
  overflow: hidden;
  white-space: nowrap;
  z-index: 1001;
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

/* Adjust header padding to accommodate marquee */
.header {
  padding: calc(1.5rem + 34px) 0 1.5rem 0;
}

.header.scrolled {
  padding: calc(1rem + 34px) 0 1rem 0;
}
"""

content = content.replace(".header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  background: #fcf2ec;\n  padding: 1.5rem 0;", ".header {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  background: #fcf2ec;\n")
content = content.replace(".header.scrolled {\n  background: rgba(255, 255, 255, 0.95);\n  backdrop-filter: blur(10px);\n  padding: 1rem 0;", ".header.scrolled {\n  background: rgba(255, 255, 255, 0.95);\n  backdrop-filter: blur(10px);\n")

content += marquee_css

with open("src/app/components/header/header.css", "w") as f:
    f.write(content)
