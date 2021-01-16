# JSON Editor

JSON Editor converts a HTML Element into a text editor for typing JSON. It has automatic indentation and syntax colouring on the fly while typing.

## Install

```bash
npm install json-text-editor
```

## Use

```javascript
const { JSON_Editor } = require('json-text-editor')

JSON_Editor( document.getElementById('myElementId') )
```

## Colour Customisation

Take a look to *style.js* which includes some CSS classes you can override to control the colours.