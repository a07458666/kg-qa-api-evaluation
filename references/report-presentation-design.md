# Report Presentation Design

This document defines a presentation-layer plan that can be adopted before the final backend schema is fixed.

## Goals
- keep evaluation data machine-readable
- allow frontend-friendly rendering hints inside the report
- support interactive KG graph visualization with D3.js
- support rich QA answer rendering with Markdown features such as tables and bold text
- keep rendering metadata optional so core evaluation remains backend-agnostic

## Design principle

Separate the report into two layers:

1. Evaluation layer
- pass/fail
- metrics
- normalized output
- regression deltas

2. Presentation layer
- rendering hints
- graph-ready node/link arrays
- markdown-ready QA fields
- UI preferences such as layout, labels, and enabled features

This keeps the report useful for both CI pipelines and rich web UIs.

## Top-level presentation block

Recommended optional top-level field:

```json
{
  "presentation": {
    "version": "1.0",
    "graph_renderer": {
      "library": "d3",
      "layout": "force",
      "directed": true,
      "zoom": true,
      "pan": true,
      "drag": true,
      "show_legend": true,
      "show_minimap": false,
      "default_node_label_field": "label",
      "default_node_group_field": "group",
      "default_edge_label_field": "label"
    },
    "qa_renderer": {
      "format": "markdown",
      "flavor": "gfm",
      "allow_tables": true,
      "allow_bold": true,
      "allow_italic": true,
      "allow_lists": true,
      "allow_blockquotes": true,
      "allow_code": true,
      "sanitize_html": true
    }
  }
}
```

## KG presentation payload

Each KG case result can optionally include a graph payload ready for D3.js.

Recommended shape:

```json
{
  "presentation": {
    "graph": {
      "renderer": "d3-force",
      "title": "kg-001 graph",
      "nodes": [
        {
          "id": "alice",
          "label": "Alice",
          "group": "person",
          "status": "matched",
          "raw_text": "Alice",
          "meta": {}
        }
      ],
      "links": [
        {
          "source": "alice",
          "target": "acme-corp",
          "label": "works_for",
          "status": "matched",
          "meta": {}
        }
      ],
      "legend": {
        "groups": ["person", "organization", "location"],
        "statuses": ["matched", "missing", "unexpected"]
      },
      "style_hints": {
        "color_by": "group",
        "edge_color_by": "status",
        "node_size_metric": null
      }
    }
  }
}
```

### Recommended semantics for KG presentation
- `status` on nodes/links can visually distinguish matched, missing, unexpected, forbidden
- `group` can map to entity type for color encoding
- `meta` can hold provenance or span info later
- D3.js force layout is the default recommendation for v1

### Useful D3.js interactions
- zoom / pan
- drag nodes
- hover tooltip
- click to highlight neighbors
- filter by entity type or relation type
- toggle expected vs generated graph overlay

## QA presentation payload

Each QA case result can optionally include Markdown-oriented fields.

Recommended shape:

```json
{
  "presentation": {
    "qa": {
      "render_mode": "markdown",
      "answer_markdown": "**Answer:** Alice works for Acme Corp.",
      "sections": [
        {
          "title": "Answer",
          "markdown": "Alice works for **Acme Corp**."
        },
        {
          "title": "Evidence",
          "markdown": "| Source | Support |\n|---|---|\n| doc-1 | Alice works for Acme Corp in Taipei. |"
        }
      ],
      "citations": [
        {
          "label": "doc-1",
          "markdown": "Alice works for Acme Corp in Taipei."
        }
      ],
      "style_hints": {
        "emphasize_failure_reasons": true,
        "collapse_long_context": true
      }
    }
  }
}
```

### Recommended Markdown features for QA
- tables
- bold and italic emphasis
- unordered and ordered lists
- blockquotes
- inline code and fenced code blocks when needed

### Recommendation for Markdown flavor
Use GitHub Flavored Markdown (GFM) as the default because tables are widely supported.

### Security recommendation
- sanitize HTML by default
- do not rely on raw HTML for essential meaning
- keep Markdown content render-safe in shared dashboards

## Separation between raw answer and rendered answer

Recommended approach:
- keep raw answer in `normalized_output.answer`
- optionally add `presentation.qa.answer_markdown`

This allows:
- exact regression checks on raw text
- richer display in dashboards without mutating source output

## Suggested future report sections in UI
- Summary cards: pass rate, regression status, latency
- KG tab: interactive D3.js graph + graph metrics + mismatch legend
- QA tab: rendered Markdown answer + citations + failure reasons + keyword hits
- Regression tab: worsened cases, deltas, and baseline comparison

## Minimal v1 recommendation
If the execution layer is not ready yet, still reserve these report fields now:
- top-level `presentation`
- case-level `presentation.graph`
- case-level `presentation.qa`

That keeps the schema forward-compatible with a future UI without locking you into a final backend response contract.
