# parseArgs

<div id="parseargs" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Parse command line arguments.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function parseArgs(args: string[], options?: ParserOptions): ArgToken[]</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/parser-D95CJBHr.d.ts#L82" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">ParserOptions</code>
  </div>
  <p class="ox-api-entry__param-description">parse options, about details see ParserOptions — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">ArgToken[]</code>
  <p class="ox-api-entry__return-description">Argument tokens.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-js">import &#123; parseArgs &#125; from &#39;args-tokens&#39; // for Node.js and Bun&#10;// import &#123; parseArgs &#125; from &#39;jsr:@kazupon/args-tokens&#39; // for Deno&#10;&#10;const tokens = parseArgs([&#39;--foo&#39;, &#39;bar&#39;, &#39;-x&#39;, &#39;--bar=baz&#39;])&#10;// do something with using tokens&#10;// ...&#10;console.log(&#39;tokens:&#39;, tokens)</code></pre>
</div>
</div>
</div>
