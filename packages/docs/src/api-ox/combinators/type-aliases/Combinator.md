# Combinator

<div id="combinator" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>A combinator produced by combinator factory functions.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">type Combinator&lt;T&gt; = &#123;&#10;  /**&#10;   * The parse function that converts a string to the desired type.&#10;   *&#10;   * @param value - The input string value.&#10;   * @returns The parsed value of type T.&#10;   */&#10;  parse: (value: string) =&gt; T;&#10;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L15-L23" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-parse">
  <td><code>parse</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(value: string) =&gt; T</code></td>
  <td><div class="ox-api-entry__member-description">The parse function that converts a string to the desired type.</div><ul class="ox-api-entry__member-params"><li><code>value</code> The input string value.</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> The parsed value of type T.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The parsed value type.</span></li><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
