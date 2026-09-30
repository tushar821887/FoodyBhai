with open("src/app/services/cart.service.ts", "r") as f:
    content = f.read()

import re

new_wa = """
        text += `\\nSubtotal: ₹${total}`;
        text += `\\nDiscount (FOODY20): -₹${discount}`;
        text += `\\nDelivery Fee: FREE`;
        text += `\\n*Total to Pay: ₹${finalTotal}*`;
    } else {
        text += `\\nSubtotal: ₹${total}`;
        text += `\\nDelivery Fee: FREE`;
        text += `\\n*Total to Pay: ₹${total}*`;
    }
"""

content = re.sub(r'\n        text \+= `\\nSubtotal: ₹\$\{total\}`;.*?    \}', new_wa, content, flags=re.DOTALL)

with open("src/app/services/cart.service.ts", "w") as f:
    f.write(content)
