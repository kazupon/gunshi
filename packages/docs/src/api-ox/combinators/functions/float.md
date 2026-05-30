# float

<div id="float" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create a floating-point argument schema with optional range validation.</p>
<p>Rejects <code>NaN</code> and <code>Infinity</code> values.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function float(opts?: FloatOptions): CombinatorSchema&lt;number&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L185" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">opts</code>
    <code class="ox-api-entry__param-type">FloatOptions</code>
  </div>
  <p class="ox-api-entry__param-description">Range options. — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CombinatorSchema&lt;number&gt;</code>
  <p class="ox-api-entry__return-description">A combinator schema that resolves to number (float).</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const args = &#123;&#10;  ratio: float(&#123; min: 0, max: 1 &#125;)&#10;&#125;</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
