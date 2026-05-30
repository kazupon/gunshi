# PluginWithExtension

<div id="pluginwithextension" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.</p>
<p>This type is used to define a plugin at <code>plugin</code> function.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface PluginWithExtension&lt;&#10;  E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&#10;&gt; extends Plugin&lt;E&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L270-L289" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
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
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Plugin identifier</div></td>
</tr>
<tr id="property-name">
  <td><code>name</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Plugin name</div></td>
</tr>
<tr id="property-dependencies">
  <td><code>dependencies</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown[]</code></td>
  <td><div class="ox-api-entry__member-description">Plugin dependencies</div></td>
</tr>
<tr id="property-extension">
  <td><code>extension</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">CommandContextExtension&lt;E&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Plugin extension</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md">GunshiParams</a> to specify the shape of <a href="/api-ox/default/interfaces/CommandContext.md"><code>CommandContext</code></a>&#39;s extensions.</span></li></ul>
</div>
</div>
