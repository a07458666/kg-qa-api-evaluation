# kg-qa-api-evaluation

[English](./README.md) | [繁體中文](./README.zh-TW.md)

Hermes skill for evaluating KG generation and QA backend APIs.

This repository contains a valid Hermes skill structure:
- `SKILL.md` as the main skill definition
- `schemas/` for JSON Schemas
- `templates/` for starter config/case/report files
- `references/` for evaluation guidance
- `docs/specs/` for the detailed v1 specification
- `scripts/` reserved for the future runner and baseline comparator

Current focus:
- schema-first design
- smoke / quality / regression evaluation model
- backend-agnostic artifact contracts

Not implemented yet:
- runnable API evaluator
- baseline comparison script
- backend-specific adapters
