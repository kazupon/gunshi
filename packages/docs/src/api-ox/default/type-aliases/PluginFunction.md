# PluginFunction

<div id="pluginfunction" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Plugin function type</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type PluginFunction&lt;G extends GunshiParams = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;PluginContext&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L100-L102" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the <a href="/api-ox/default/interfaces/PluginContext.md"><code>PluginContext</code></a>.</span></li></ul>
</div>
</div>
