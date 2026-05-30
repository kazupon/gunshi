# Commandable

<div id="commandable" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Define a command type.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Commandable&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt; = | Command&lt;G&gt;&#10;  | LazyCommand&lt;G, &#123;&#125;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L644-L646" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command.</span></li></ul>
</div>
</div>
