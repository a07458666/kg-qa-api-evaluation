---
name: kg-qa-api-evaluation
description: Evaluate backend APIs that generate knowledge graphs and answer questions. Provides a schema-first workflow for smoke tests, rule-based quality checks, and baseline regression comparisons.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [evaluation, llm, api, knowledge-graph, qa, regression, testing]
    related_skills: [writing-plans, systematic-debugging, test-driven-development]
---

# KG + QA API Evaluation

## Overview

Use this skill to evaluate backend APIs that:
- extract knowledge graphs from text
- answer questions from context or retrieved evidence

This workflow is intentionally agent-agnostic. The repository is compatible with Hermes-style skills, but the config formats, schemas, templates, and evaluation process are designed so most coding agents or automation systems can reuse them.

This skill is designed for LLM-style outputs, where success is not just HTTP 200 but also output quality, schema validity, and regression stability.

The workflow is schema-first:
1. define config and case files
2. validate artifacts against JSON Schemas
3. run smoke or quality evaluation
4. compare output with a baseline report
5. convert production failures into future regression cases

## When to Use

Use this skill when:
- a KG extraction endpoint is added or changed
- a QA endpoint is added or changed
- prompts, models, retrievers, or parsers were updated
- you need repeatable smoke checks before release
- you need regression checks against a saved baseline
- you want a standard case-file format for backend evaluation

Do not use this skill as the sole method for:
- large-scale load testing
- deep semantic judging without an explicit LLM judge pipeline
- multi-turn agent evaluation
- production observability and monitoring setup

## What v1 Covers

### Included in v1
- smoke validation
- request/response contract validation
- rule-based KG checks
- rule-based QA checks
- JSON report generation
- baseline report comparison

### Explicitly out of scope for v1
- LLM-as-a-judge scoring
- graph edit distance and advanced graph metrics
- load/performance stress testing
- automatic ingestion of production logs into cases

## Repository Layout

Recommended layout:

```text
kg-qa-api-evaluation/
  SKILL.md
  README.md
  docs/specs/kg-qa-api-evaluation-v1.md
  references/
    evaluation-rubric.md
    case-design-guidelines.md
    report-presentation-design.md
  templates/
    config.example.json
    kg-cases.example.json
    qa-cases.example.json
    report.example.json
  schemas/
    config.schema.json
    kg-cases.schema.json
    qa-cases.schema.json
    report.schema.json
  scripts/
    run_eval.py            # to be added when backend contract is known
    compare_reports.py     # to be added when execution logic is implemented
```

## Inputs

### Required
- backend base URL
- auth strategy
- KG endpoint config and/or QA endpoint config
- case files for KG and/or QA
- thresholds for pass/fail

### Optional
- baseline report path
- abstention patterns
- allowed relation types
- raw-response retention

## Canonical Artifacts

This skill expects four main artifact types.

### 1. Config
Defines:
- environment
- auth
- HTTP behavior
- endpoint mappings
- thresholds
- regression settings

Schema:
- `schemas/config.schema.json`

Template:
- `templates/config.example.json`

### 2. KG cases
Each case contains:
- input text
- optional metadata
- expected entities
- expected relations
- allowed relation types
- forbidden entities/relations

Schema:
- `schemas/kg-cases.schema.json`

Template:
- `templates/kg-cases.example.json`

### 3. QA cases
Each case contains:
- question
- optional context
- expected keywords
- forbidden keywords
- expected citations
- abstention expectation

Schema:
- `schemas/qa-cases.schema.json`

Template:
- `templates/qa-cases.example.json`

### 4. Report
A run produces:
- summary counts
- per-endpoint summary metrics
- per-case results
- optional regression summary
- optional presentation metadata for graph and rich-text rendering

Schema:
- `schemas/report.schema.json`

Template:
- `templates/report.example.json`

Presentation design reference:
- `references/report-presentation-design.md`

## Evaluation Modes

### Smoke
Check:
- endpoint reachable
- auth works
- response parseable
- key fields present
- output not empty

Use for:
- post-deploy checks
- fast CI checks
- endpoint bring-up

### Quality
Check:
- schema validity
- KG entity/relation matching
- QA keyword/citation/abstention behavior
- threshold-based pass/fail

Use for:
- prompt or model changes
- parser changes
- release readiness checks

### Regression
Check:
- current report vs baseline report
- pass-rate drops
- metric drops
- worsened cases

Use for:
- release gating
- model migration validation
- retriever changes

## KG Evaluation Rules

Core checks in v1:
- response is parseable
- entities field exists and is iterable
- relations field exists and is iterable
- required entity fields exist
- required relation fields exist
- relation types comply with allowed list when configured
- expected entities are matched after normalization
- expected relations are matched after normalization
- forbidden entities/relations do not appear
- duplicate entities/relations are counted

Recommended v1 metrics:
- entity_match_rate
- relation_match_rate
- invalid_relation_count
- duplicate_entity_count
- duplicate_relation_count
- forbidden_hit_count

## QA Evaluation Rules

Core checks in v1:
- answer field exists
- answer is non-empty
- answer length is within threshold bounds
- expected keywords appear at acceptable rate
- forbidden keywords do not appear
- citations exist when required
- abstention behavior matches expectation when configured

Recommended v1 metrics:
- expected_keyword_hit_rate
- forbidden_keyword_hits
- citation_hits
- abstention_pass
- groundedness_rule_pass

## Minimal Execution Workflow

### Step 1: Confirm endpoint contract
Collect or inspect:
- HTTP method
- path
- request shape
- response shape
- auth/header requirements

If the contract is unknown, do not guess. Inspect backend code or API docs first.

### Step 2: Prepare config and cases
Start from templates:
- `templates/config.example.json`
- `templates/kg-cases.example.json`
- `templates/qa-cases.example.json`

Then replace example fields with real endpoint mappings and real cases.

### Step 3: Validate files against schemas
Before running any evaluator, validate:
- config against `schemas/config.schema.json`
- KG case file against `schemas/kg-cases.schema.json`
- QA case file against `schemas/qa-cases.schema.json`

Do not debug runtime failures until schema validation passes.

### Step 4: Run smoke mode first
Run smoke mode against a small case set.

If smoke fails, fix contract/auth/parser issues before running quality mode.

### Step 5: Run quality mode
Run the full selected KG/QA case sets.

Produce a JSON report conforming to `schemas/report.schema.json`.

### Step 6: Compare with baseline
If a baseline report exists, compare current metrics against baseline thresholds.

Flag:
- pass-rate drop
- metric regressions
- worsened cases

### Step 7: Harvest failures into future cases
For any meaningful backend failure:
- add a KG or QA regression case
- encode forbidden outputs or missing expectations
- keep the case small and deterministic where possible

## Verification Checklist

Before declaring success, verify:
- config file validates against schema
- case files validate against schema
- endpoint mappings match real backend fields
- smoke mode succeeds on at least one KG/QA case
- report JSON validates against schema
- regression comparison is meaningful if baseline is present

## Pitfalls

Common failure modes:
- using field names from memory instead of backend code
- mixing semantic expectations with exact-string expectations without documenting normalization
- making QA expectations too strict before adding an LLM-judge layer
- forgetting abstention rules for unanswerable questions
- comparing reports generated from different case sets without labeling them
- allowing relation labels to drift without updating `allowed_relation_types`

## Extension Points

When backend code becomes available, extend this skill with:
- adapter functions for request building
- nested response extraction
- entity normalization hooks
- citation validators
- baseline comparison script
- a runnable evaluator script

See:
- `docs/specs/kg-qa-api-evaluation-v1.md`
- `references/evaluation-rubric.md`
- `references/case-design-guidelines.md`
- `references/report-presentation-design.md`

## Practical Default

If you have no runner yet, use this skill first as a design and validation standard:
- finalize schema and case design
- align backend response mappings
- only then implement `run_eval.py`

That sequence prevents brittle evaluation code built on guessed contracts.
