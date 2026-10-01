const fs = require('fs');
const path = 'frontend/src/app/pages/cart/cart.html';
let content = fs.readFileSync(path, 'utf8');

// I'll just restore the original and add the wrap correctly.
// Let's do a strict replacement.
// Let's find the closing of step 2.
// It ends with:
/*
                }
              </div>
            </div>
          }

          <!-- STEP 3: FINAL REVIEW -->
*/
// Let's replace the whole block carefully.

content = content.replace(/                \} @else \{\n                  <div class="form-group mb-2">\n                    <label>Complete Address \*\/label>[\s\S]*?<\/div>\n                \}\n              <\/div>\n            <\/div>\n          \}/g, '');
