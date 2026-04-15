# Evaluation Rubric

## KG rubric

### Contract
- Response body is valid JSON.
- Expected top-level fields exist.
- Entity and relation arrays are accessible through configured field mappings.

### Structure
- Required entity fields exist.
- Required relation fields exist.
- Relation source and target can be resolved to normalized entities when possible.
- Relation labels conform to allowed relation types when configured.

### Content
- Expected entities are present.
- Expected relations are present.
- Forbidden entities are absent.
- Forbidden relations are absent.
- Duplicate entities and relations are counted and compared with thresholds.

## QA rubric

### Contract
- Response body is valid JSON.
- Configured answer field exists.
- Configured citation field exists when required.

### Structure
- Answer is non-empty.
- Answer length is within configured bounds.
- Citations are parseable when returned.

### Content
- Expected keywords appear at or above threshold.
- Forbidden keywords do not appear.
- Abstention occurs for unanswerable questions when expected.
- Groundedness checks remain rule-based in v1 and should be interpreted conservatively.

## Regression rubric
- Compare reports only when case sets are compatible.
- Track both aggregate metric deltas and worsened individual cases.
- Treat schema failures as high-severity regressions.
- Treat forbidden-output hits as high-severity regressions.
