# dependency.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/dependency.ts)**

> 1 documented symbol. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>1</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>returns</span>
</span>
</div>

## Reference

<details v-pre id="resolvedependencies" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">resolveDependencies&lt;E extends GunshiParams[&#39;extensions&#39;]&gt;(plugins: Plugin&lt;E&gt;[]): Plugin&lt;E&gt;[]</code><span class="ox-api-entry__description">Resolve plugin dependencies using topological sort</span><span class="ox-api-entry__meta"><span class="ox-api-badge">1 param</span><span class="ox-api-badge">returns Plugin[]</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Resolve plugin dependencies using topological sort</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function resolveDependencies&lt;E extends GunshiParams[&#39;extensions&#39;]&gt;(plugins: Plugin&lt;E&gt;[]): Plugin&lt;E&gt;[]</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/dependency.ts#L15-L74">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">plugins</code>
    <code class="ox-api-entry__param-type">Plugin[]</code>
  </div>
  <p class="ox-api-entry__param-description">Array of plugins to resolve</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Plugin[]</code>
  <p class="ox-api-entry__return-description">Array of plugins sorted by dependencies</p>
</div>
</div>
  </div>
</details>
