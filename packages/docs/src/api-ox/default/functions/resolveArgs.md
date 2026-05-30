# resolveArgs

<div id="resolveargs" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Resolve command line arguments.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare function resolveArgs&lt;A extends Args&gt;(args: A, tokens: ArgToken[], &#123;&#10;  shortGrouping,&#10;  skipPositional,&#10;  toKebab&#10;&#125;?: ResolveArgs): &#123;&#10;  values: ArgValues&lt;A&gt;;&#10;  positionals: string[];&#10;  rest: string[];&#10;  error: AggregateError | undefined;&#10;  explicit: ArgExplicitlyProvided&lt;A&gt;;&#10;&#125;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts#L547-L557" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">A</code>
  </div>
  <p class="ox-api-entry__param-description">An arguments that contains <a href="/api-ox/default/interfaces/ArgSchema.md">arguments schema</a>.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">tokens</code>
    <code class="ox-api-entry__param-type">ArgToken[]</code>
  </div>
  <p class="ox-api-entry__param-description">An array of <a href="/api-ox/default/interfaces/ArgToken.md">tokens</a>.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">resolveArgs</code>
    <code class="ox-api-entry__param-type">unknown</code>
  </div>
  <p class="ox-api-entry__param-description">An arguments that contains resolve arguments.</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">param</code>
    <code class="ox-api-entry__param-type">ResolveArgs</code>
  </div>
  <p class="ox-api-entry__param-description">optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">{ ... }</code>
  <p class="ox-api-entry__return-description">An object that contains the values of the arguments, positional arguments, rest arguments, validation errors, and explicit provision status.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-typescript">// passed tokens: --port 3000&#10;&#10;const &#123; values, explicit &#125; = resolveArgs(&#123;&#10;  port: &#123;&#10;    type: &#39;number&#39;,&#10;    default: 8080&#10;  &#125;,&#10;  host: &#123;&#10;    type: &#39;string&#39;,&#10;    default: &#39;localhost&#39;&#10;  &#125;&#10;&#125;, parsedTokens)&#10;&#10;values.port // 3000&#10;values.host // &#39;localhost&#39;&#10;&#10;explicit.port // true (explicitly provided)&#10;explicit.host // false (not provided, fallback to default)</code></pre>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">A - <a href="/api-ox/default/interfaces/Args.md">Arguments</a>, which is an object that defines the command line arguments.</span></li></ul>
</div>
</div>
