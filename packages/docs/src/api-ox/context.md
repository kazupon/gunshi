# context.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts)**

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
  <strong>2</strong>
  <span>parameters</span>
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

<details v-pre id="createplugincontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">createPluginContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(decorators: Decorators&lt;G&gt;, initialSubCommands?: Map&lt;string, Command&lt;G&gt; | LazyCommand&lt;G&gt;&gt;): PluginContext&lt;G&gt;</code><span class="ox-api-entry__description">Factory function for creating a plugin context.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">2 params</span><span class="ox-api-badge">returns PluginContext</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Factory function for creating a plugin context.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export function createPluginContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(decorators: Decorators&lt;G&gt;, initialSubCommands?: Map&lt;string, Command&lt;G&gt; | LazyCommand&lt;G&gt;&gt;): PluginContext&lt;G&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L142-L238">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">decorators</code>
    <code class="ox-api-entry__param-type">Decorators</code>
  </div>
  <p class="ox-api-entry__param-description">A {@linkcode Decorators} instance.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">initialSubCommands</code>
    <code class="ox-api-entry__param-type">Map</code>
  </div>
  <p class="ox-api-entry__param-description">Initial sub commands map. — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">PluginContext</code>
  <p class="ox-api-entry__return-description">A new {@linkcode PluginContext} instance.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="plugincontext" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">interface</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">PluginContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code><span class="ox-api-entry__description">Gunshi plugin context interface.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">since v0.27.0</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Gunshi plugin context interface.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L28-L131">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
  </div>
</details>
