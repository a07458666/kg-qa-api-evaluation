# Case Design Guidelines

## General principles
- Prefer small, focused cases over long documents.
- Keep one main expectation per case when possible.
- Encode known failures as dedicated regression cases.
- Separate smoke cases from golden cases.
- Name cases so failures are understandable from the ID/title alone.

## KG cases
- Use short texts with unambiguous entities and relations for smoke tests.
- Add aliases when surface forms may vary.
- Keep relation labels aligned with the backend ontology.
- Use forbidden entities/relations to encode common hallucinations.
- Do not overload one case with too many optional expectations.

## QA cases
- Use expected keywords instead of exact answers in v1 unless the answer is truly deterministic.
- Add forbidden keywords for common hallucinations or unsafe claims.
- Mark `should_abstain=true` for questions not answerable from provided context.
- Use expected citations only when citation behavior is part of the contract.

## Baselines
- Regenerate baselines only after intentional improvements or approved contract changes.
- Version baseline reports together with case files.
- Do not compare reports from different schemas or different case sets without labeling the difference.
