# kg-qa-api-evaluation v1 Specification Draft

## 1. Purpose

`kg-qa-api-evaluation` is a schema-first evaluation framework for backend APIs that:
- generate knowledge graphs (KG) from unstructured text
- answer questions (QA), optionally grounded in supplied context

The v1 goal is to make evaluation repeatable, baseline-comparable, and easy to extend once backend implementation details are available.

## 2. Scope

### In scope for v1
- endpoint health/smoke validation
- request/response contract validation
- rule-based KG quality checks
- rule-based QA quality checks
- baseline report comparison
- JSON artifact output for version control and regression tracking

### Out of scope for v1
- LLM-as-a-judge scoring pipeline
- large-scale load testing
- multi-turn agent evaluation
- automatic production-log ingestion
- advanced graph edit distance metrics

## 3. Supported endpoint types

### 3.1 KG endpoint
Expected logical behavior:
- accept text or document-like payload
- return extracted entities and relations
- optionally return metadata, provenance, spans, model info

Canonical normalized output expected by evaluator:
- `entities: Entity[]`
- `relations: Relation[]`
- `metadata?: object`

### 3.2 QA endpoint
Expected logical behavior:
- accept a question
- optionally accept context or references
- return an answer
- optionally return citations/evidence/metadata

Canonical normalized output expected by evaluator:
- `answer: string`
- `citations?: Citation[] | string[]`
- `metadata?: object`

## 4. Evaluation modes

### 4.1 smoke
Purpose:
- validate reachability, auth, latency, parseability, and non-empty output

### 4.2 quality
Purpose:
- validate schema and rule-based quality requirements over test cases

### 4.3 regression
Purpose:
- compare current report with a baseline report and flag regressions

## 5. Repository artifacts

Recommended repo structure:

```text
kg-qa-api-evaluation/
  README.md
  docs/specs/kg-qa-api-evaluation-v1.md
  schemas/
    config.schema.json
    kg-cases.schema.json
    qa-cases.schema.json
    report.schema.json
  examples/
    config.example.json
    kg-cases.example.json
    qa-cases.example.json
    report.example.json
```

## 6. Config schema design

The evaluator config is split into global settings and endpoint-specific settings.

### 6.1 Top-level fields
- `schema_version: string` — currently `"1.0"`
- `project_name: string`
- `environment_name: string` — e.g. `dev`, `staging`, `prod`
- `base_url: string` — API root URL
- `default_headers?: object<string,string>`
- `auth?: AuthConfig`
- `http?: HttpConfig`
- `output?: OutputConfig`
- `kg_endpoint?: KgEndpointConfig`
- `qa_endpoint?: QaEndpointConfig`
- `thresholds?: ThresholdConfig`
- `regression?: RegressionConfig`

### 6.2 AuthConfig
Supports initial common patterns:
- bearer token
- api key in header
- no auth

Fields:
- `type: "none" | "bearer" | "header"`
- `token_env?: string`
- `header_name?: string`
- `prefix?: string`

Rules:
- `bearer` requires `token_env`
- `header` requires both `token_env` and `header_name`

### 6.3 HttpConfig
Fields:
- `timeout_seconds: integer >= 1`
- `retry_count: integer >= 0`
- `verify_ssl: boolean`
- `concurrency?: integer >= 1`
- `max_response_chars?: integer >= 1`

### 6.4 OutputConfig
Fields:
- `output_dir: string`
- `save_raw_response: boolean`
- `write_summary_markdown?: boolean`

### 6.5 KgEndpointConfig
Fields:
- `enabled: boolean`
- `path: string`
- `method: "POST" | "PUT"`
- `request_template: object`
- `input_field_mapping: KgInputFieldMapping`
- `response_field_mapping: KgResponseFieldMapping`
- `required_entity_fields: string[]`
- `required_relation_fields: string[]`
- `allowed_relation_types?: string[]`
- `case_file: string`

`KgInputFieldMapping` fields:
- `input_text_field: string`
- `metadata_field?: string`

`KgResponseFieldMapping` fields:
- `entities_field: string`
- `relations_field: string`
- `metadata_field?: string`
- `entity_id_field?: string`
- `entity_text_field: string`
- `entity_type_field?: string`
- `relation_source_field: string`
- `relation_type_field: string`
- `relation_target_field: string`

### 6.6 QaEndpointConfig
Fields:
- `enabled: boolean`
- `path: string`
- `method: "POST" | "PUT"`
- `request_template: object`
- `input_field_mapping: QaInputFieldMapping`
- `response_field_mapping: QaResponseFieldMapping`
- `require_citations: boolean`
- `abstention_patterns?: string[]`
- `case_file: string`

`QaInputFieldMapping` fields:
- `question_field: string`
- `context_field?: string`
- `metadata_field?: string`

`QaResponseFieldMapping` fields:
- `answer_field: string`
- `citations_field?: string`
- `metadata_field?: string`

### 6.7 ThresholdConfig
Fields:
- `kg?: KgThresholds`
- `qa?: QaThresholds`

`KgThresholds`:
- `min_entity_match_rate: number [0,1]`
- `min_relation_match_rate: number [0,1]`
- `max_duplicate_entities: integer >= 0`
- `max_duplicate_relations: integer >= 0`
- `fail_on_forbidden_hits: boolean`

`QaThresholds`:
- `min_expected_keyword_hit_rate: number [0,1]`
- `min_answer_length: integer >= 0`
- `max_answer_length: integer >= 1`
- `fail_on_forbidden_keywords: boolean`
- `require_abstention_when_expected: boolean`

### 6.8 RegressionConfig
Fields:
- `baseline_report_path?: string`
- `fail_on_regression: boolean`
- `max_pass_rate_drop?: number [0,1]`
- `max_metric_drop?: number [0,1]`

## 7. KG case schema design

Each KG case represents one evaluation input and expectation bundle.

### 7.1 Top-level file shape
- `schema_version: string`
- `cases: KgCase[]`

### 7.2 KgCase fields
- `id: string`
- `title?: string`
- `tags?: string[]`
- `input_text: string`
- `metadata?: object`
- `expected_entities?: ExpectedEntity[]`
- `expected_relations?: ExpectedRelation[]`
- `allowed_relation_types?: string[]`
- `forbidden_entities?: string[]`
- `forbidden_relations?: ExpectedRelation[]`
- `notes?: string`

### 7.3 ExpectedEntity
Fields:
- `text: string`
- `type?: string`
- `aliases?: string[]`
- `required?: boolean` default true

Matching recommendation:
- normalize case and surrounding whitespace
- match aliases if provided
- allow project-specific post-normalization later

### 7.4 ExpectedRelation
Fields:
- `source: string`
- `relation: string`
- `target: string`
- `source_aliases?: string[]`
- `target_aliases?: string[]`
- `required?: boolean` default true

Matching recommendation:
- normalize case and surrounding whitespace
- exact relation label match in v1
- allow alias matching only for source and target nodes

## 8. QA case schema design

### 8.1 Top-level file shape
- `schema_version: string`
- `cases: QaCase[]`

### 8.2 QaCase fields
- `id: string`
- `title?: string`
- `tags?: string[]`
- `question: string`
- `context?: string`
- `metadata?: object`
- `expected_answer?: string`
- `expected_keywords?: string[]`
- `forbidden_keywords?: string[]`
- `expected_citations?: string[]`
- `should_abstain?: boolean`
- `notes?: string`

### 8.3 v1 QA matching rules
- `expected_answer` is optional because many QA systems are semantically correct without string identity
- `expected_keywords` are the main v1 correctness signal
- `forbidden_keywords` catch hallucinated or dangerous phrasing
- `expected_citations` validate citation presence, not deep semantic citation correctness
- `should_abstain=true` expects answer text to match a configured abstention pattern

## 9. Report schema design

### 9.1 Top-level report fields
- `schema_version: string`
- `run_id: string`
- `timestamp: string` — ISO8601
- `project_name: string`
- `environment_name: string`
- `mode: "smoke" | "quality" | "regression" | "full"`
- `git_commit?: string`
- `total_cases: integer`
- `passed_cases: integer`
- `failed_cases: integer`
- `average_latency_ms?: number`
- `schema_failures: integer`
- `kg_summary?: KgRunSummary`
- `qa_summary?: QaRunSummary`
- `regression_summary?: RegressionSummary`
- `presentation?: PresentationConfig`
- `case_results: CaseResult[]`

### 9.1.1 PresentationConfig
Purpose:
- allow rich UI rendering without changing the core evaluation semantics
- keep report files machine-readable for CI while also supporting dashboards

Fields:
- `version: string`
- `graph_renderer?: GraphRendererConfig`
- `qa_renderer?: QaRendererConfig`

`GraphRendererConfig` fields:
- `library: "d3"`
- `layout: "force" | "radial" | "dagre-like"`
- `directed?: boolean`
- `zoom?: boolean`
- `pan?: boolean`
- `drag?: boolean`
- `show_legend?: boolean`
- `show_minimap?: boolean`
- `default_node_label_field?: string`
- `default_node_group_field?: string`
- `default_edge_label_field?: string`

`QaRendererConfig` fields:
- `format: "markdown"`
- `flavor?: "gfm" | "commonmark"`
- `allow_tables?: boolean`
- `allow_bold?: boolean`
- `allow_italic?: boolean`
- `allow_lists?: boolean`
- `allow_blockquotes?: boolean`
- `allow_code?: boolean`
- `sanitize_html?: boolean`

Recommendation:
- use D3.js force layout for KG graph rendering in v1
- use GitHub Flavored Markdown for QA rich-text rendering so tables are supported

### 9.2 KgRunSummary
Fields:
- `total_cases: integer`
- `passed_cases: integer`
- `failed_cases: integer`
- `avg_entity_match_rate?: number`
- `avg_relation_match_rate?: number`
- `invalid_relation_count: integer`
- `duplicate_entity_count: integer`
- `duplicate_relation_count: integer`
- `forbidden_hit_count: integer`

### 9.3 QaRunSummary
Fields:
- `total_cases: integer`
- `passed_cases: integer`
- `failed_cases: integer`
- `avg_expected_keyword_hit_rate?: number`
- `forbidden_keyword_hit_count: integer`
- `citation_pass_count: integer`
- `abstention_pass_count: integer`
- `groundedness_rule_pass_count?: integer`

### 9.4 RegressionSummary
Fields:
- `baseline_report_path: string`
- `is_regression_detected: boolean`
- `metrics_delta: object`
- `worsened_cases?: string[]`
- `improved_cases?: string[]`
- `gating_result?: "pass" | "fail"`

### 9.5 CaseResult
Common fields:
- `id: string`
- `endpoint_type: "kg" | "qa"`
- `status: "passed" | "failed" | "error"`
- `latency_ms?: number`
- `failure_reasons: string[]`
- `request_payload?: object`
- `normalized_output?: object`
- `presentation?: CasePresentation`
- `raw_response?: object | string | null`
- `metrics?: object`

### 9.5.1 CasePresentation
Optional presentation payload per case.

Fields:
- `graph?: GraphPresentation`
- `qa?: QaPresentation`

`GraphPresentation` fields:
- `renderer: "d3-force"`
- `title?: string`
- `nodes: GraphNode[]`
- `links: GraphLink[]`
- `legend?: object`
- `style_hints?: object`

`GraphNode` fields:
- `id: string`
- `label: string`
- `group?: string`
- `status?: string`
- `raw_text?: string`
- `meta?: object`

`GraphLink` fields:
- `source: string`
- `target: string`
- `label: string`
- `status?: string`
- `meta?: object`

`QaPresentation` fields:
- `render_mode: "markdown"`
- `answer_markdown: string`
- `sections?: MarkdownSection[]`
- `citations?: MarkdownCitation[]`
- `style_hints?: object`

`MarkdownSection` fields:
- `title: string`
- `markdown: string`

`MarkdownCitation` fields:
- `label: string`
- `markdown: string`

Recommendation:
- keep raw answer in `normalized_output.answer`
- use `presentation.qa.answer_markdown` only for UI rendering
- keep graph visualization data in `presentation.graph.nodes` and `presentation.graph.links`

KG-specific metrics recommendation:
- `entity_match_count`
- `entity_expected_count`
- `entity_match_rate`
- `relation_match_count`
- `relation_expected_count`
- `relation_match_rate`
- `invalid_relation_count`
- `duplicate_entity_count`
- `duplicate_relation_count`
- `forbidden_hit_count`

QA-specific metrics recommendation:
- `answer_present`
- `answer_length`
- `expected_keyword_hits`
- `expected_keyword_total`
- `expected_keyword_hit_rate`
- `forbidden_keyword_hits`
- `citation_hits`
- `citation_expected_total`
- `abstention_pass`
- `groundedness_rule_pass`

## 10. Pass/fail semantics

### 10.1 KG case failure conditions
A KG case fails if any of the following occurs:
- request error or non-success HTTP status
- invalid or unparseable response body
- missing configured entities/relations fields
- required entity/relation fields missing
- relation references non-existent entities when resolvable
- forbidden entity or forbidden relation appears
- entity match rate below threshold
- relation match rate below threshold

### 10.2 QA case failure conditions
A QA case fails if any of the following occurs:
- request error or non-success HTTP status
- invalid or unparseable response body
- missing configured answer field
- answer empty after normalization
- forbidden keyword appears and configured as fatal
- expected keyword hit rate below threshold
- expected abstention not observed when required
- citations required but absent

## 11. Normalization guidance for v1

Minimal normalization allowed in v1:
- trim whitespace
- lowercase for matching
- collapse repeated internal spaces
- deduplicate exact repeated entities/relations after normalization

Deferred to later versions:
- fuzzy entity linking
- semantic answer similarity
- ontology-aware relation equivalence

## 12. Extension points for backend-specific adapters

Once backend code is available, the evaluator can add adapter hooks for:
- custom request building
- nested response extraction
- entity/relation normalization functions
- custom abstention detectors
- project-specific citation validators

Suggested adapter interfaces:
- `build_kg_payload(case, config) -> dict`
- `normalize_kg_response(raw_response, config) -> dict`
- `build_qa_payload(case, config) -> dict`
- `normalize_qa_response(raw_response, config) -> dict`

## 13. Recommended next implementation steps

1. Confirm actual backend endpoint paths and payload shapes.
2. Bind canonical field mappings to real request/response bodies.
3. Decide whether config stays JSON or changes to YAML.
4. Add Python runner that validates files against schemas before making API calls.
5. Add report comparison helper for baseline regressions.
6. Add a presentation-aware UI layer that renders `presentation.graph` via D3.js and `presentation.qa` via sanitized Markdown.
