# extend

<div id="extend" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Extend a schema by overriding or adding fields.</p>
<p>Equivalent to <code>merge(base, overrides)</code> but communicates the intent of intentional overrides rather than general composition.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function extend&lt;T extends Args, U extends Args&gt;(base: T, overrides: U): Omit&lt;T, keyof U&gt; &amp; U</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L630" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">base</code>
    <code class="ox-api-entry__param-type">T</code>
  </div>
  <p class="ox-api-entry__param-description">The base schema to extend.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">overrides</code>
    <code class="ox-api-entry__param-type">U</code>
  </div>
  <p class="ox-api-entry__param-description">Fields to override or add.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Omit&lt;T, keyof U&gt; &amp; U</code>
  <p class="ox-api-entry__return-description">A new schema with overrides applied.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const base = args(&#123; port: withDefault(integer(), 8080) &#125;)&#10;const strict = extend(base, &#123; port: required(integer(&#123; min: 1, max: 65535 &#125;)) &#125;)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - Base schema type.</span></li></ul>
</div>
</div>
