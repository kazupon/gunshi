# RenderingOptions

<div id="renderingoptions" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Rendering control options</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface RenderingOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L520-L546" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-header">
  <td><code>header</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Header rendering configuration<br>- <code>null</code>: Disable rendering<br>- <code>function</code>: Use custom renderer<br>- <code>undefined</code> (when omitted): Use default renderer</div></td>
</tr>
<tr id="property-usage">
  <td><code>usage</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Usage rendering configuration<br>- <code>null</code>: Disable rendering<br>- <code>function</code>: Use custom renderer<br>- <code>undefined</code> (when omitted): Use default renderer</div></td>
</tr>
<tr id="property-validationerrors">
  <td><code>validationErrors</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Validation errors rendering configuration<br>- <code>null</code>: Disable rendering<br>- <code>function</code>: Use custom renderer<br>- <code>undefined</code> (when omitted): Use default renderer</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of render options.</span></li><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li></ul>
</div>
</div>
