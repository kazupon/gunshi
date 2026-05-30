# ArgToken

<div id="argtoken" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Argument token.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">interface ArgToken</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/parser-D95CJBHr.d.ts#L26-L52" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-kind">
  <td><code>kind</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ArgTokenKind</code></td>
  <td><div class="ox-api-entry__member-description">Argument token kind.</div></td>
</tr>
<tr id="property-index">
  <td><code>index</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">number</code></td>
  <td><div class="ox-api-entry__member-description">Argument token index, e.g <code>--foo bar</code> =&gt; <code>--foo</code> index is 0, <code>bar</code> index is 1.</div></td>
</tr>
<tr id="property-name">
  <td><code>name</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Option name, e.g. <code>--foo</code> =&gt; <code>foo</code>, <code>-x</code> =&gt; <code>x</code>.</div></td>
</tr>
<tr id="property-rawname">
  <td><code>rawName</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Raw option name, e.g. <code>--foo</code> =&gt; <code>--foo</code>, <code>-x</code> =&gt; <code>-x</code>.</div></td>
</tr>
<tr id="property-value">
  <td><code>value</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Option value, e.g. <code>--foo=bar</code> =&gt; <code>bar</code>, <code>-x=bar</code> =&gt; <code>bar</code>.<br>If the <code>allowCompatible</code> option is <code>true</code>, short option value will be same as Node.js <code>parseArgs</code> behavior.</div></td>
</tr>
<tr id="property-inlinevalue">
  <td><code>inlineValue</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Inline value, e.g. <code>--foo=bar</code> =&gt; <code>true</code>, <code>-x=bar</code> =&gt; <code>true</code>.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
