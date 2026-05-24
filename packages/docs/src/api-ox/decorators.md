# decorators.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/decorators.ts)**

> 2 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>2</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>interfaces</span>
</span>
<span class="ox-api-stat">
  <strong>1</strong>
  <span>returns</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="createdecorators" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">createDecorators&lt; G extends GunshiParamsConstraint = DefaultGunshiParams &gt;(): Decorators&lt;G&gt;</code><span class="ox-api-entry__description">Factory function for creating a decorators manager.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">returns Decorators</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Factory function for creating a decorators manager.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function createDecorators&lt;&#10;  G extends GunshiParamsConstraint = DefaultGunshiParams&#10;&gt;(): Decorators&lt;G&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/decorators.ts#L66-L149">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Decorators</code>
  <p class="ox-api-entry__return-description">A new decorators manager instance</p>
</div>
</div>
  </div>
</details>

<details v-pre id="decorators" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">Decorators&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Interface for managing renderer and command decorators. This interface defines…</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Interface for managing renderer and command decorators. This interface defines the contract for decorator management in plugins.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface Decorators&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/decorators.ts#L23-L59">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@internal</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
  </div>
</details>
