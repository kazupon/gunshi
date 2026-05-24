# builtin.ts

**[Source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts)**

> 6 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

<div class="ox-api-stats" aria-label="API reference summary">
<span class="ox-api-stat">
  <strong>6</strong>
  <span>symbols</span>
</span>
<span class="ox-api-stat">
  <strong>6</strong>
  <span>functions</span>
</span>
<span class="ox-api-stat">
  <strong>18</strong>
  <span>parameters</span>
</span>
<span class="ox-api-stat">
  <strong>6</strong>
  <span>returns</span>
</span>
</div>

## Reference

<div class="ox-api-controls" data-ox-api-target=".ox-api-entry" role="toolbar" aria-label="Reference display controls">
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="expand">Open all</button>
<button type="button" class="ox-api-controls__button" data-ox-api-toggle="collapse">Close all</button>
</div>

<details v-pre id="cli" class="ox-api-entry">
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt;G extends GunshiParamsConstraint&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;G extends GunshiParamsConstraint&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L34-L38">View source</a></p>
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
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli&lt; A extends Args = Args, G extends GunshiParams = { args: A; extensions: {} } &gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command.</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli&lt;&#10;  A extends Args = Args,&#10;  G extends GunshiParams = &#123; args: A; extensions: &#123;&#125; &#125;&#10;&gt;(args: string[], entry: Command&lt;G&gt; | CommandRunner&lt;G&gt; | LazyCommand&lt;G&gt;, options?: CliOptions&lt;G&gt;): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L50-L57">View source</a></p>
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
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L69-L76">View source</a></p>
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
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L88-L92">View source</a></p>
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
  <summary><span class="ox-api-entry__kind">fn</span><span class="ox-api-entry__summary-main"><code class="ox-api-entry__signature ox-api-entry__signature--highlighted language-typescript">cli(args: string[], entry: SubCommandable, options?: CliOptions): Promise&lt;string | undefined&gt;</code><span class="ox-api-entry__description">Run the command. This overload accepts any command-like object using a loose st…</span><span class="ox-api-entry__meta"><span class="ox-api-badge">3 params</span><span class="ox-api-badge">returns Promise</span></span></span></summary>
  <div class="ox-api-entry__body">
<div class="ox-api-entry__prose">
<p>Run the command.</p>
<p>This overload accepts any command-like object using a loose structural type. It bypasses TypeScript contravariance issues with callback properties.</p>
<p>Note: This overload MUST be last in the overload list. TypeScript checks overloads in declaration order and selects the first matching one. The SubCommandable type is intentionally loose and would match any command, so placing it first would prevent proper type inference for more specific command types.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export async function cli(args: string[], entry: SubCommandable, options?: CliOptions): Promise&lt;string | undefined&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L110-L114">View source</a></p>
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
    <code class="ox-api-entry__param-type">SubCommandable</code>
  </div>
  <p class="ox-api-entry__param-description">A command-like object (command, command runner, or lazy command)</p>
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
<p class="ox-api-entry__source"><a href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L126-L133">View source</a></p>
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
