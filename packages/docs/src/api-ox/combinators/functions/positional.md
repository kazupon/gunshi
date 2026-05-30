# positional

<div id="positional" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create a positional argument schema.</p>
<p>Without a parser, resolves to string. With a parser (e.g., <code>positional(integer())</code>), resolves to the parser&#39;s return type.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function positional(parser?: BaseOptions): ArgSchema &amp; ArgSchemaPositionalType</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L264" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">parser</code>
    <code class="ox-api-entry__param-type">BaseOptions</code>
  </div>
  <p class="ox-api-entry__param-description">Optional base options (description, short, required). — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">ArgSchema &amp; ArgSchemaPositionalType</code>
  <p class="ox-api-entry__return-description">A positional argument schema resolving to string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const args = &#123;&#10;  command: positional(),           // resolves to string&#10;  port: positional(integer()),     // resolves to number&#10;&#125;</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
