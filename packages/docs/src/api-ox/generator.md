# generator.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts)**

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
  <span>types</span>
</span>
<span class="ox-api-stat">
  <strong>3</strong>
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

<details v-pre id="generate" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">generate&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(command: string | string[] | null, entry: Command&lt;G&gt; | LazyCommand&lt;G&gt;, options: GenerateOptions&lt;G&gt; = {}): Promise&lt;string&gt;</code><span class="ox-api-entry__description">Generate the command usage.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Generate the command usage.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function generate&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;(command: string | string[] | null, entry: Command&lt;G&gt; | LazyCommand&lt;G&gt;, options: GenerateOptions&lt;G&gt; = &#123;&#125;): Promise&lt;string&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L45-L62">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">command</code>
    <code class="ox-api-entry__param-type">string | string[] | null</code>
  </div>
  <p class="ox-api-entry__param-description">usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify <code>null</code>.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A {@linkcode Command | entry command}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">GenerateOptions</code>
  </div>
  <p class="ox-api-entry__param-description">A {@linkcode GenerateOptions | cli options} — optional · default: {}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A rendered usage.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="generateoptions" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">type</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">GenerateOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = CliOptions&lt;G&gt;</code><span class="ox-api-entry__description">generate options of <code>generate</code> function.</span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>generate options of <code>generate</code> function.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type GenerateOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = CliOptions&lt;G&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L33">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of {@linkcode CliOptions}.</span></li></ul>
</div>
  </div>
</details>
