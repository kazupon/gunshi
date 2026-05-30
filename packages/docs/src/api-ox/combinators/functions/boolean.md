# boolean

<div id="boolean" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create a boolean argument schema.</p>
<p>Boolean arguments are existence-based. The resolver passes <code>&quot;true&quot;</code> or <code>&quot;false&quot;</code> to the parse function based on the presence or negation of the flag.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function boolean(opts?: BooleanOptions): CombinatorSchema&lt;boolean&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L216" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">opts</code>
    <code class="ox-api-entry__param-type">BooleanOptions</code>
  </div>
  <p class="ox-api-entry__param-description">Boolean options. — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CombinatorSchema&lt;boolean&gt;</code>
  <p class="ox-api-entry__return-description">A combinator schema for boolean flags.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const args = &#123;&#10;  color: boolean(&#123; negatable: true &#125;)&#10;&#125;&#10;// Usage: --color (true), --no-color (false)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
