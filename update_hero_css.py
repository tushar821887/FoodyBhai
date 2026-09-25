with open("src/app/components/hero/hero.css", "r") as f:
    content = f.read()

media_992_addition = """
  .img-wrapper img {
    height: 400px;
  }
"""

media_768_addition = """
  .img-wrapper img {
    height: 260px;
  }
  
  .floating-card {
    left: 10px;
    bottom: -15px;
    padding: 0.5rem 1rem;
  }
  
  .floating-card strong {
    font-size: 1rem;
  }
"""

content = content.replace("  .floating-card {\n    left: 20px;\n  }", "  .floating-card {\n    left: 20px;\n  }\n" + media_992_addition)
content = content.replace("  .hero-stats {\n    gap: 1.5rem;\n  }", "  .hero-stats {\n    gap: 1.5rem;\n  }\n" + media_768_addition)

with open("src/app/components/hero/hero.css", "w") as f:
    f.write(content)
