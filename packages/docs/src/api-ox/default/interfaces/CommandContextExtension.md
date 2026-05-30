# CommandContextExtension

<div id="commandcontextextension" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command context extension</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandContextExtension&lt;&#10;  E extends GunshiParams[&#39;extensions&#39;] = DefaultGunshiParams[&#39;extensions&#39;]&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L496-L511" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-key">
  <td><code>key</code><span class="ox-api-badge">readonly</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">symbol</code></td>
  <td><div class="ox-api-entry__member-description">Plugin identifier</div></td>
</tr>
<tr id="property-factory">
  <td><code>factory</code><span class="ox-api-badge">readonly</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(ctx: CommandContextCore, cmd: Command) =&gt; Awaitable&lt;E&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Plugin extension factory</div></td>
</tr>
<tr id="property-onfactory">
  <td><code>onFactory</code><span class="ox-api-badge">optional</span><span class="ox-api-badge">readonly</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(ctx: Readonly&lt;CommandContext&gt;, cmd: Readonly&lt;Command&gt;) =&gt; Awaitable&lt;void&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Plugin extension factory after hook</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md#property-extensions"><code>GunshiParams.extensions</code></a> to specify the shape of the extension.</span></li></ul>
</div>
</div>
