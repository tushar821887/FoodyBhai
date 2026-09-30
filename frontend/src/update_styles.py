with open("src/styles.css", "r") as f:
    content = f.read()

media_query = """
@media (max-width: 768px) {
  body {
    padding-bottom: 60px; /* space for bottom nav */
  }
}
"""

if "padding-bottom: 60px" not in content:
    with open("src/styles.css", "a") as f:
        f.write("\n" + media_query)
