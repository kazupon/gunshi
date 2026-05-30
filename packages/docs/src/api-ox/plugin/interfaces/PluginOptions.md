# PluginOptions

<div id="pluginoptions" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Plugin definition options</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginOptions&lt;&#10;  DepExt extends ExtendContext = DefaultGunshiParams[&#39;extensions&#39;], // for plugin dependency extensions&#10;  Id extends string = string, // for plugin id&#10;  Deps extends ReadonlyArray&lt;PluginDependency | string&gt; = (PluginDependency | string)[], // for plugin dependencies&#10;  Ext extends Record&lt;string, unknown&gt; = &#123;&#125;, // for plugin extension type&#10;  ResolvedDepExt extends GunshiParams = DependencyParams&lt;Deps, DepExt&gt;,&#10;  PluginExt extends PluginExtension&lt;Ext, ResolvedDepExt&gt; = PluginExtension&lt;Ext, ResolvedDepExt&gt;,&#10;  MergedExt extends GunshiParams = MergedPluginParams&lt;&#10;    Id,&#10;    Deps,&#10;    DepExt,&#10;    Awaited&lt;ReturnType&lt;PluginExt&gt;&gt;&#10;  &gt;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L205-L243" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-id">
  <td><code>id</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Id</code></td>
  <td><div class="ox-api-entry__member-description">Plugin unique identifier</div></td>
</tr>
<tr id="property-name">
  <td><code>name</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Plugin name</div></td>
</tr>
<tr id="property-dependencies">
  <td><code>dependencies</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Deps</code></td>
  <td><div class="ox-api-entry__member-description">Plugin dependencies</div></td>
</tr>
<tr id="property-setup">
  <td><code>setup</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">PluginFunction&lt;MergedExt&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Plugin setup function</div></td>
</tr>
<tr id="property-extension">
  <td><code>extension</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">PluginExt</code></td>
  <td><div class="ox-api-entry__member-description">Plugin extension</div></td>
</tr>
<tr id="property-onextension">
  <td><code>onExtension</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">OnPluginExtension&lt;MergedExt&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Callback for when the plugin is extended with <code>extension</code> option.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
