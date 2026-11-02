const fs = require('fs');

let css = fs.readFileSync('frontend/src/styles.css', 'utf8');

const scrollbarRule = `
/* Hide browser scrollbar completely while maintaining scrollability */
html,
body,
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
*::-webkit-scrollbar {
  display: none !important;
  width: 0px !important;
  height: 0px !important;
}
`;

if (!css.includes('scrollbar-width: none !important')) {
  css = css.replace("@import 'tailwindcss';", "@import 'tailwindcss';" + scrollbarRule);
  fs.writeFileSync('frontend/src/styles.css', css, 'utf8');
  console.log('Successfully added scrollbar hiding rules to styles.css');
} else {
  console.log('Already added');
}
