# Viewer Prototype

Static report viewer prototype for `kg-qa-api-evaluation`.

## Stack
- Static HTML
- Vanilla JavaScript
- D3.js for KG graphs
- markdown-it for QA Markdown rendering
- DOMPurify for sanitization

## Run locally

Because the viewer fetches `./data/report.sample.json`, serve the folder with a local static server.

Examples:

```bash
cd viewer
python3 -m http.server 8000
```

Then open:
- http://localhost:8000/

## Current capabilities
- Overview summary cards
- KG tab with D3.js graph rendering
- QA tab with Markdown rendering
- Regression summary tab
- Local JSON file upload

## Notes
- This is a prototype scaffold, not the final polished UI.
- It is intentionally backend-agnostic and reads report JSON instead of calling APIs directly.
