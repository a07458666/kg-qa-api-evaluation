# kg-qa-api-evaluation

[English](./README.md) | [繁體中文](./README.zh-TW.md)

Reusable evaluation workflow for KG generation and QA backend APIs.

This repository is designed to be useful across Hermes and other agent or automation setups:
- `SKILL.md` provides the core workflow definition
- `schemas/` contains JSON Schemas
- `templates/` provides starter config/case/report files
- `references/` provides evaluation guidance
- `docs/specs/` contains the detailed v1 specification
- `scripts/` is reserved for the future runner and baseline comparator

Current focus:
- schema-first design
- smoke / quality / regression evaluation model
- backend-agnostic artifact contracts
- portability across different agent workflows

Not implemented yet:
- runnable API evaluator
- baseline comparison script
- backend-specific adapters
