with open("src/app/components/footer/footer.css", "r") as f:
    content = f.read()

content = content.replace("grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));", "grid-template-columns: 1.5fr 1fr 1fr 1fr;")

media_query = """

@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
"""

with open("src/app/components/footer/footer.css", "w") as f:
    f.write(content + media_query)
