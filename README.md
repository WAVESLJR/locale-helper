# locale-helper

A web-based tool to translate Shopify theme locale files using translator APIs.  
Built with **SvelteKit**, this app allows you to input your theme's locale JSON, select source and target languages, and get a translated locale JSON automatically.

---

## Features

- Input and output JSON editors with syntax highlighting and line numbers
- Automatic prettifying and validation of JSON
- Language selection with support for multiple APIs (Google Translate, DeepL)
- Handles placeholders in strings (`{variable}`) safely during translation
- Copy translated JSON with a single click
- Responsive layout for desktop and mobile
- Supports batch translation for large JSON files

---

## Tech Stack

- **Frontend & Backend:** [SvelteKit](https://kit.svelte.dev/)
- **State Management:** Svelte stores
- **HTTP Requests:** Axios
- **Utilities:** Custom utils for JSON handling and string extraction
- **Styling:** CSS Variables, TailwindCSS optional

---

## Supported Languages

Uses [LOCALE_CODES](./src/lib/constants.js) as reference.  
Example supported languages:

