# bone.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/bone.ts)**

> 4 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>4</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>12</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>4</strong>
  <span>returns</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="cli" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt; A extends Args = Args, G extends GunshiParams = { args: A; extensions: {} } &gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;&#10;  A extends Args = Args,&#10;  G extends GunshiParams = &#123; args: A; extensions: &#123;&#125; &#125;&#10;&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/bone.ts#L29-L36">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command | CommandRunner | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">CliOptions</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CliOptions | CLI options} — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">A - The type of {@linkcode Args | arguments} defined in the command and cli options.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="cli" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt; E extends ExtendContext = ExtendContext, G extends GunshiParams = { args: Args; extensions: E } &gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;&#10;  E extends ExtendContext = ExtendContext,&#10;  G extends GunshiParams = &#123; args: Args; extensions: E &#125;&#10;&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/bone.ts#L48-L55">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command | CommandRunner | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">CliOptions</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CliOptions | CLI options} — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">E - An {@linkcode ExtendContext} type to specify the shape of command and cli options.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="cli" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt;G extends GunshiParams = DefaultGunshiParams&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;G extends GunshiParams = DefaultGunshiParams&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/bone.ts#L67-L71">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command | CommandRunner | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">CliOptions</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CliOptions | CLI options} — optional</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.</span></li></ul>
</div>
  </div>
</details>

<details v-pre id="cli" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt;G extends GunshiParams = DefaultGunshiParams&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options: CliOptions&lt;G&gt; = {}): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;G extends GunshiParams = DefaultGunshiParams&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options: CliOptions&lt;G&gt; = &#123;&#125;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/bone.ts#L83-L89">View source</a></p>
<div class="ox-api-entry__section ox-api-entry__section--params">
<h4>Parameters</h4>
<ul class="ox-api-entry__params">
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">args</code>
    <code class="ox-api-entry__param-type">string[]</code>
  </div>
  <p class="ox-api-entry__param-description">Command line arguments</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">entry</code>
    <code class="ox-api-entry__param-type">Command | CommandRunner | LazyCommand</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}</p>
</li>
<li class="ox-api-entry__param">
  <div class="ox-api-entry__param-heading">
    <code class="ox-api-entry__param-name">options</code>
    <code class="ox-api-entry__param-type">CliOptions</code>
  </div>
  <p class="ox-api-entry__param-description">A {@link CliOptions | CLI options} — optional · default: {}</p>
</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--returns">
<h4>Returns</h4>
<div class="ox-api-entry__return">
  <code class="ox-api-entry__return-type">Promise</code>
  <p class="ox-api-entry__return-description">A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.</p>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.</span></li></ul>
</div>
  </div>
</details>
