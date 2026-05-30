# choice

<div id="choice" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Create an enum-like argument schema with literal type inference.</p>
<p>Uses <code>const T</code> generic to infer literal union types from the values array.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function choice&lt;const T extends readonly string[]&gt;(values: T, opts?: BaseOptions): CombinatorSchema&lt;T[number]&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L286" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">values</code>
    <code class="ox-api-entry__param-type">T</code>
  </div>
  <p class="ox-api-entry__param-description">Allowed values.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">opts</code>
    <code class="ox-api-entry__param-type">BaseOptions</code>
  </div>
  <p class="ox-api-entry__param-description">Common options (description, short, required). — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CombinatorSchema&lt;T[number]&gt;</code>
  <p class="ox-api-entry__return-description">A combinator schema that resolves to a union of the allowed values.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const args = &#123;&#10;  level: choice([&#39;debug&#39;, &#39;info&#39;, &#39;warn&#39;, &#39;error&#39;] as const)&#10;&#125;&#10;// typeof values.level === &#39;debug&#39; | &#39;info&#39; | &#39;warn&#39; | &#39;error&#39;</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The readonly array of allowed string values.</span></li></ul>
</div>
</div>
