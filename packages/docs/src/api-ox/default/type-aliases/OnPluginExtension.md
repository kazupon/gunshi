# OnPluginExtension

<div id="onpluginextension" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Plugin extension callback, which is called when the plugin is extended with <code>extension</code> option.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type OnPluginExtension&lt;G extends GunshiParams = DefaultGunshiParams&gt; = (&#10;  ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;,&#10;  cmd: Readonly&lt;Command&lt;G&gt;&gt;&#10;) =&gt; Awaitable&lt;void&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L131-L134" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The <a href="/api-ox/default/interfaces/CommandContext.md"><code>command context</code></a></p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The <a href="/api-ox/default/interfaces/Command.md"><code>command</code></a></p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of <a href="/api-ox/default/interfaces/CommandContext.md"><code>CommandContext</code></a> and <a href="/api-ox/default/interfaces/Command.md"><code>Command</code></a>.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
