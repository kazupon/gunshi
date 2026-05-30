# GunshiParams

<div id="gunshiparams" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Gunshi unified parameter type.</p>
<p>This type combines both argument definitions and command context extensions.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface GunshiParams&lt;&#10;  P extends &#123;&#10;    args?: Args&#10;    extensions?: ExtendContext&#10;  &#125; = &#123;&#10;    args: Args&#10;    extensions: &#123;&#125;&#10;  &#125;&#10;&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L42-L59" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-args">
  <td><code>args</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown</code></td>
  <td><div class="ox-api-entry__member-description">Command argument definitions.</div></td>
</tr>
<tr id="property-extensions">
  <td><code>extensions</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown</code></td>
  <td><div class="ox-api-entry__member-description">Command context extensions.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.0</span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">P - The type of parameters, which can include <code>args</code> and <code>extensions</code>.</span></li></ul>
</div>
</div>
