# ArgSchema

<div id="argschema" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>An argument schema definition for command-line argument parsing.</p>
<p>This schema is similar to the schema of Node.js <code>util.parseArgs</code> but with extended features:</p>
<ul>
<li>Additional <code>required</code> and <code>description</code> properties</li>
<li>Extended <code>type</code> support: &#39;string&#39;, &#39;boolean&#39;, &#39;number&#39;, &#39;enum&#39;, &#39;positional&#39;, &#39;custom&#39;</li>
<li>Simplified <code>default</code> property (single type, not union types)</li>
</ul>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">interface ArgSchema</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/Users/kazuya.kawaguchi/Projects/my/gunshi/node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts#L44-L427" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-type">
  <td><code>type</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">&quot;string&quot; | &quot;boolean&quot; | &quot;number&quot; | &quot;enum&quot; | &quot;positional&quot; | &quot;custom&quot;</code></td>
  <td><div class="ox-api-entry__member-description">Type of the argument value.<br><br>- <code>&#39;string&#39;</code>: Text value (default if not specified)<br>- <code>&#39;boolean&#39;</code>: <code>true</code>/<code>false</code> flag (can be negatable with <code>--no-</code> prefix)<br>- <code>&#39;number&#39;</code>: Numeric value (parsed as integer or float)<br>- <code>&#39;enum&#39;</code>: One of predefined string values (requires <code>choices</code> property)<br>- <code>&#39;positional&#39;</code>: Non-option argument by position<br>- <code>&#39;custom&#39;</code>: Custom parsing with user-defined <code>parse</code> function</div></td>
</tr>
<tr id="property-short">
  <td><code>short</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Single character alias for the long option name.<br><br>As example, allows users to use <code>-x</code> instead of <code>--extended-option</code>.<br>Only valid for non-positional argument types.</div></td>
</tr>
<tr id="property-description">
  <td><code>description</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Human-readable description of the argument&#39;s purpose.<br><br>Used for help text generation and documentation.<br>Should be concise but descriptive enough to understand the argument&#39;s role.</div></td>
</tr>
<tr id="property-required">
  <td><code>required</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Marks the argument as required.<br><br>When <code>true</code>, the argument must be provided by the user.<br>If missing, an <code>ArgResolveError</code> with type &#39;required&#39; will be thrown.<br><br>Note: Only <code>true</code> is allowed (not <code>false</code>) to make intent explicit.</div></td>
</tr>
<tr id="property-multiple">
  <td><code>multiple</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">true</code></td>
  <td><div class="ox-api-entry__member-description">Allows the argument to accept multiple values.<br><br>When <code>true</code>, the resolved value becomes an array.<br>For options: can be specified multiple times (--tag foo --tag bar)<br>For positional: collects remaining positional arguments<br><br>Note: Only <code>true</code> is allowed (not <code>false</code>) to make intent explicit.</div></td>
</tr>
<tr id="property-negatable">
  <td><code>negatable</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Enables negation for boolean arguments using <code>--no-</code> prefix.<br><br>When <code>true</code>, allows users to explicitly set the boolean to <code>false</code><br>using <code>--no-option-name</code>. When <code>false</code> or omitted, only positive<br>form is available.<br><br>Only applicable to <code>type: &#39;boolean&#39;</code> arguments.</div></td>
</tr>
<tr id="property-choices">
  <td><code>choices</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[] | unknown</code></td>
  <td><div class="ox-api-entry__member-description">Array of allowed string values for enum-type arguments.<br><br>Required when <code>type: &#39;enum&#39;</code>. The argument value must be one of these choices,<br>otherwise an <code>ArgResolveError</code> with type &#39;type&#39; will be thrown.<br><br>Supports both mutable arrays and readonly arrays for type safety.</div></td>
</tr>
<tr id="property-default">
  <td><code>default</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | boolean | number</code></td>
  <td><div class="ox-api-entry__member-description">Default value used when the argument is not provided.<br><br>The type must match the argument&#39;s <code>type</code> property:<br>- <code>string</code> type: string default<br>- <code>boolean</code> type: boolean default<br>- <code>number</code> type: number default<br>- <code>enum</code> type: must be one of the <code>choices</code> values<br>- <code>positional</code>/<code>custom</code> type: any appropriate default</div></td>
</tr>
<tr id="property-tokebab">
  <td><code>toKebab</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">true</code></td>
  <td><div class="ox-api-entry__member-description">Converts the argument name from camelCase to kebab-case for CLI usage.<br><br>When <code>true</code>, a property like <code>maxCount</code> becomes available as <code>--max-count</code>.<br>This allows <a href="https://github.com/cacjs/cac">CAC</a> user-friendly property names while maintaining CLI conventions.<br><br>Can be overridden globally with <code>resolveArgs({ toKebab: true })</code>.<br><br>Note: Only <code>true</code> is allowed (not <code>false</code>) to make intent explicit.</div></td>
</tr>
<tr id="property-conflicts">
  <td><code>conflicts</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | string[]</code></td>
  <td><div class="ox-api-entry__member-description">Names of other options that conflict with this option.<br><br>When this option is used together with any of the conflicting options,<br>an <code>ArgResolveError</code> with type &#39;conflict&#39; will be thrown.<br><br>Conflicts only need to be defined on one side - if option A defines a conflict<br>with option B, the conflict is automatically detected when both are used,<br>regardless of whether B also defines a conflict with A.<br><br>Supports both single option name or array of option names.<br>Option names must match the property keys in the schema object exactly<br>(no automatic conversion between camelCase and kebab-case).</div></td>
</tr>
<tr id="property-metavar">
  <td><code>metavar</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Display name hint for help text generation.<br><br>Provides a meaningful type hint for the argument value in help output.<br>Particularly useful for <code>type: &#39;custom&#39;</code> arguments where the type<br>name would otherwise be unhelpful.</div></td>
</tr>
<tr id="property-parse">
  <td><code>parse</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(value: string) =&gt; any</code></td>
  <td><div class="ox-api-entry__member-description">Custom parsing function for <code>type: &#39;custom&#39;</code> arguments.<br><br>Required when <code>type: &#39;custom&#39;</code>. Receives the raw string value and must<br>return the parsed result. Should throw an Error (or subclass) if parsing fails.<br><br>The function&#39;s return type becomes the resolved argument type.</div><ul class="ox-api-entry__member-params"><li><code>value</code> Raw string value from command line</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> Parsed value of any type</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--examples">
<h4>Examples</h4>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 1</div>
<pre v-pre><code class="language-ts">Basic string argument:&#10;```ts&#10;const schema: ArgSchema = &#123;&#10;  type: &#39;string&#39;,&#10;  description: &#39;Server hostname&#39;,&#10;  default: &#39;localhost&#39;&#10;&#125;&#10;```</code></pre>
</div>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 2</div>
<pre v-pre><code class="language-ts">Required number argument with alias:&#10;```ts&#10;const schema: ArgSchema = &#123;&#10;  type: &#39;number&#39;,&#10;  short: &#39;p&#39;,&#10;  description: &#39;Port number to listen on&#39;,&#10;  required: true&#10;&#125;&#10;```</code></pre>
</div>
<div class="ox-api-entry__example">
<div class="ox-api-entry__example-heading">Example 3</div>
<pre v-pre><code class="language-ts">Enum argument with choices:&#10;```ts&#10;const schema: ArgSchema = &#123;&#10;  type: &#39;enum&#39;,&#10;  choices: [&#39;info&#39;, &#39;warn&#39;, &#39;error&#39;],&#10;  description: &#39;Logging level&#39;,&#10;  default: &#39;info&#39;&#10;&#125;&#10;```</code></pre>
</div>
</div>
</div>
