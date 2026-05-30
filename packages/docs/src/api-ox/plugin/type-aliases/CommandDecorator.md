# CommandDecorator

<div id="commanddecorator" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command decorator.</p>
<p>A function that wraps a command runner to add or modify its behavior.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandDecorator&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  baseRunner: (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt;&#10;) =&gt; (ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;string | void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L760-L762" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">baseRunner</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The base command runner to decorate</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">The decorated command runner</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/plugin/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command context.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
