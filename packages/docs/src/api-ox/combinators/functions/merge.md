# merge

<div id="merge" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Compose multiple <a href="/api-ox/default/interfaces/Args.md">Args</a> schemas into one.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function merge&lt;T extends Args[]&gt;(...schemas: T): MergeArgs&lt;T&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts#L608" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">schemas</code>
    <code class="ox-api-entry__param-type">T</code>
  </div>
  <p class="ox-api-entry__param-description">The schemas to merge.</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">MergeArgs&lt;T&gt;</code>
  <p class="ox-api-entry__return-description">A merged schema containing all fields.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@experimental</span><span class="ox-api-entry__tag-value"></span></li></ul>
</div>
</div>
