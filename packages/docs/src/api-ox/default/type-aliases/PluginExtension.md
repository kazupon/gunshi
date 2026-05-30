# PluginExtension

<div id="pluginextension" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Plugin extension</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export type PluginExtension&lt;&#10;  T = Record&lt;string, unknown&gt;,&#10;  G extends GunshiParams = DefaultGunshiParams&#10;&gt; = (ctx: CommandContextCore&lt;G&gt;, cmd: Command&lt;G&gt;) =&gt; Awaitable&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L116-L119" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">ctx</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The <a href="/api-ox/default/type-aliases/CommandContextCore.md"><code>command context</code></a> core</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">cmd</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">The <a href="/api-ox/default/interfaces/Command.md"><code>command</code></a> to which the plugin is being applied</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">unknown</code>
  <p class="ox-api-entry__return-description">An object of type T that represents the extension provided by the plugin</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The type of the extension object returned by the plugin extension function.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
