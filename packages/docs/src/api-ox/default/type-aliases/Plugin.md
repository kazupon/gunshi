# Plugin

<div id="plugin" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Gunshi plugin, which is a function that receives a PluginContext.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type Plugin&lt;E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&gt; = PluginFunction &amp; &#123;&#10;    id: string&#10;    name?: string&#10;    dependencies?: (PluginDependency | string)[]&#10;    extension?: CommandContextExtension&lt;E&gt;&#10;  &#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L255-L261" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">A <a href="/api-ox/default/interfaces/PluginContext.md"><code>PluginContext</code></a>.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">An <a href="/api-ox/default/type-aliases/Awaitable.md"><code>Awaitable</code></a> that resolves when the plugin is loaded.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md">GunshiParams</a> to specify the shape of <a href="/api-ox/default/interfaces/CommandContext.md"><code>CommandContext</code></a>&#39;s extensions.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
