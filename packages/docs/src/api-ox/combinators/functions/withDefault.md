# withDefault

<div id="withdefault" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Set a default value on a combinator schema.</p>
<p>The original schema is not modified.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function withDefault&lt;T extends string | boolean | number&gt;(schema: CombinatorSchema&lt;T&gt;, defaultValue: T): CombinatorSchema&lt;T&gt; &amp; CombinatorWithDefault&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L389" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">schema</code>
    <code class="ox-api-entry__param-type">CombinatorSchema&lt;T&gt;</code>
  </div>
  <p class="ox-api-entry__param-description">The base combinator schema.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">defaultValue</code>
    <code class="ox-api-entry__param-type">T</code>
  </div>
  <p class="ox-api-entry__param-description">The default value.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">CombinatorSchema&lt;T&gt; &amp; CombinatorWithDefault&lt;T&gt;</code>
  <p class="ox-api-entry__return-description">A new schema with the default value set.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">const args = &#123;&#10;  port: withDefault(integer(&#123; min: 1, max: 65535 &#125;), 8080)&#10;&#125;</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">T - The schema&#39;s parsed type.</span></li><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
