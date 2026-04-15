const state = {
  report: null,
  currentTab: 'overview',
};

const md = window.markdownit({ html: false, linkify: true, breaks: true });

const els = {
  projectTitle: document.getElementById('projectTitle'),
  runMeta: document.getElementById('runMeta'),
  statusBadge: document.getElementById('statusBadge'),
  overview: document.getElementById('overview'),
  kg: document.getElementById('kg'),
  qa: document.getElementById('qa'),
  regression: document.getElementById('regression'),
  reportFile: document.getElementById('reportFile'),
  loadSampleBtn: document.getElementById('loadSampleBtn'),
  navBtns: Array.from(document.querySelectorAll('.nav-btn')),
};

function setTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === tab);
  });
  els.navBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function renderOverview() {
  if (!state.report) {
    els.overview.innerHTML = '<div class="card">Load a report JSON to start.</div>';
    return;
  }
  const r = state.report;
  els.overview.innerHTML = `
    <div class="grid-cards">
      <div class="card"><div class="muted">Passed</div><div class="metric">${r.passed_cases ?? 0}</div></div>
      <div class="card"><div class="muted">Failed</div><div class="metric">${r.failed_cases ?? 0}</div></div>
      <div class="card"><div class="muted">Latency</div><div class="metric">${r.average_latency_ms ?? '-'} ms</div></div>
      <div class="card"><div class="muted">Schema Failures</div><div class="metric">${r.schema_failures ?? 0}</div></div>
    </div>
    <div class="card">
      <h3>Run Summary</h3>
      <ul class="meta-list">
        <li>Mode: ${r.mode ?? '-'}</li>
        <li>Project: ${r.project_name ?? '-'}</li>
        <li>Environment: ${r.environment_name ?? '-'}</li>
        <li>Timestamp: ${r.timestamp ?? '-'}</li>
      </ul>
    </div>
  `;
}

function renderTable(rows, columns) {
  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((c) => `<td>${escapeHtml(String(row[c.key] ?? ''))}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function renderKg() {
  if (!state.report) {
    els.kg.innerHTML = '<div class="card">No KG report loaded.</div>';
    return;
  }
  const cases = (state.report.case_results || []).filter((c) => c.endpoint_type === 'kg');
  if (!cases.length) {
    els.kg.innerHTML = '<div class="card">No KG case results found.</div>';
    return;
  }
  els.kg.innerHTML = cases.map((item, i) => `
    <article class="card case-card">
      <div class="case-header">
        <div>
          <h3>${escapeHtml(item.id)}</h3>
          <p class="muted">Latency: ${item.latency_ms ?? '-'} ms</p>
        </div>
        <div class="case-status ${item.status}">${escapeHtml(item.status)}</div>
      </div>
      <div class="graph-wrap" id="graph-${i}"></div>
      ${item.failure_reasons?.length ? `<div><h4>Failure Reasons</h4><ul class="failure-list">${item.failure_reasons.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>` : ''}
      <div>
        <h4>Entities</h4>
        ${renderTable(item.normalized_output?.entities || [], [
          { key: 'text', label: 'Text' },
          { key: 'type', label: 'Type' }
        ])}
      </div>
      <div>
        <h4>Relations</h4>
        ${renderTable(item.normalized_output?.relations || [], [
          { key: 'source', label: 'Source' },
          { key: 'relation', label: 'Relation' },
          { key: 'target', label: 'Target' }
        ])}
      </div>
    </article>
  `).join('');

  cases.forEach((item, i) => drawGraph(`#graph-${i}`, item.presentation?.graph));
}

function renderQa() {
  if (!state.report) {
    els.qa.innerHTML = '<div class="card">No QA report loaded.</div>';
    return;
  }
  const cases = (state.report.case_results || []).filter((c) => c.endpoint_type === 'qa');
  if (!cases.length) {
    els.qa.innerHTML = '<div class="card">No QA case results found.</div>';
    return;
  }
  els.qa.innerHTML = cases.map((item) => {
    const markdown = item.presentation?.qa?.answer_markdown || item.normalized_output?.answer || '_No answer_';
    const rendered = DOMPurify.sanitize(md.render(markdown));
    const sections = item.presentation?.qa?.sections || [];
    return `
      <article class="card case-card">
        <div class="case-header">
          <div>
            <h3>${escapeHtml(item.id)}</h3>
            <p class="muted">Latency: ${item.latency_ms ?? '-'} ms</p>
          </div>
          <div class="case-status ${item.status}">${escapeHtml(item.status)}</div>
        </div>
        <div class="markdown-scroll"><div class="markdown-body">${rendered}</div></div>
        ${sections.length ? sections.map((section) => `<section><h4>${escapeHtml(section.title)}</h4><div class="markdown-scroll"><div class="markdown-body">${DOMPurify.sanitize(md.render(section.markdown || ''))}</div></div></section>`).join('') : ''}
        ${item.failure_reasons?.length ? `<div><h4>Failure Reasons</h4><ul class="failure-list">${item.failure_reasons.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>` : ''}
      </article>
    `;
  }).join('');
}

function renderRegression() {
  if (!state.report) {
    els.regression.innerHTML = '<div class="card">No regression data loaded.</div>';
    return;
  }
  const reg = state.report.regression_summary;
  if (!reg) {
    els.regression.innerHTML = '<div class="card">No regression summary found.</div>';
    return;
  }
  const deltas = Object.entries(reg.metrics_delta || {}).map(([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(String(v))}</li>`).join('');
  els.regression.innerHTML = `
    <div class="card">
      <h3>Regression Summary</h3>
      <ul class="meta-list">
        <li>Baseline: ${escapeHtml(reg.baseline_report_path || '-')}</li>
        <li>Detected: ${escapeHtml(String(reg.is_regression_detected))}</li>
        <li>Gate: ${escapeHtml(reg.gating_result || '-')}</li>
      </ul>
    </div>
    <div class="card">
      <h3>Metric Deltas</h3>
      <ul class="meta-list">${deltas || '<li>No deltas</li>'}</ul>
    </div>
  `;
}

function updateMeta() {
  const r = state.report;
  if (!r) return;
  els.projectTitle.textContent = r.project_name || 'Report Viewer';
  els.runMeta.textContent = `${r.environment_name || '-'} • ${r.mode || '-'} • ${r.timestamp || '-'}`;
  els.statusBadge.textContent = r.failed_cases > 0 ? 'attention' : 'healthy';
}

function renderAll() {
  renderOverview();
  renderKg();
  renderQa();
  renderRegression();
  updateMeta();
}

function drawGraph(selector, graph) {
  const root = document.querySelector(selector);
  if (!root) return;
  root.innerHTML = '';
  if (!graph?.nodes?.length) {
    root.innerHTML = '<div class="card">No graph presentation data.</div>';
    return;
  }

  const width = root.clientWidth || 800;
  const height = 420;
  const svg = d3.select(root).append('svg').attr('width', width).attr('height', height);
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.5, 3]).on('zoom', (event) => g.attr('transform', event.transform)));

  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const nodes = graph.nodes.map((d) => ({ ...d }));
  const links = graph.links.map((d) => ({ ...d }));

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = g.append('g')
    .attr('stroke', '#90A4AE')
    .attr('stroke-opacity', 0.65)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', 2);

  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 9)
    .attr('fill', (d) => color(d.group || 'default'))
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded));

  node.append('title').text((d) => `${d.label}${d.group ? ` (${d.group})` : ''}`);

  const labels = g.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text((d) => d.label)
    .attr('font-size', 12)
    .attr('fill', '#E7ECFF')
    .attr('dx', 12)
    .attr('dy', 4);

  simulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
    node
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);
    labels
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y);
  });

  function dragStarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadSample() {
  const res = await fetch('./data/report.sample.json');
  state.report = await res.json();
  renderAll();
}

els.navBtns.forEach((btn) => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
els.loadSampleBtn.addEventListener('click', loadSample);
els.reportFile.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  state.report = JSON.parse(text);
  renderAll();
});

setTab('overview');
loadSample().catch(() => {
  renderOverview();
});
