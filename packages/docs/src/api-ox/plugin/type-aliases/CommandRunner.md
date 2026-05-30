# CommandRunner

<div id="commandrunner" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command runner.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type CommandRunner&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;string | void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L730-L732" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/plugin/interfaces/CommandContext.md">command context</a></p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">void or string (for CLI output)</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/plugin/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command context.</span></li></ul>
</div>
</div>
