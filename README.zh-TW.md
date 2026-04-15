# kg-qa-api-evaluation

[English](./README.md) | [繁體中文](./README.zh-TW.md)

可重複使用的 KG 生成與 QA 後端 API 評估工作流。

這個 repository 的設計目標是同時能被 Hermes 與其他 agent / automation workflow 使用：
- `SKILL.md`：核心工作流定義
- `schemas/`：JSON Schema 契約
- `templates/`：設定檔、測試案例、報告的起始範本
- `references/`：評估準則與案例設計指引
- `docs/specs/`：詳細 v1 規格文件
- `scripts/`：預留未來的 evaluator 與 baseline comparator

目前重點：
- schema-first 設計
- smoke / quality / regression 評估模型
- 與特定 backend 實作解耦的 artifact 契約
- 可移植到不同 agent workflow 的設計
- 已先規劃報告呈現層：Graph 可用 D3.js，QA 回答支援 Markdown rich text

尚未實作：
- 可執行的 API evaluator
- baseline comparison script
- backend-specific adapter
