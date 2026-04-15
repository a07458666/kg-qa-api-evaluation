# kg-qa-api-evaluation

[English](./README.md) | [繁體中文](./README.zh-TW.md)

用來評估 KG 生成與 QA 後端 API 的 Hermes skill。

這個 repository 目前已具備合法的 Hermes skill 結構：
- `SKILL.md`：主要 skill 定義
- `schemas/`：JSON Schema 契約
- `templates/`：設定檔、測試案例、報告的起始範本
- `references/`：評估準則與案例設計指引
- `docs/specs/`：詳細 v1 規格文件
- `scripts/`：預留未來的 evaluator 與 baseline comparator

目前重點：
- schema-first 設計
- smoke / quality / regression 評估模型
- 與特定 backend 實作解耦的 artifact 契約

尚未實作：
- 可執行的 API evaluator
- baseline comparison script
- backend-specific adapter
