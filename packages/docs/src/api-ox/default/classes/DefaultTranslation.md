# DefaultTranslation

<div id="defaulttranslation" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Default implementation of <code>TranslationAdapter</code>.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">declare class DefaultTranslation implements TranslationAdapter</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/plugin-i18n/lib/index.d.ts#L954-L993" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Constructors</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="constructor">
  <td><code>constructor</code></td>
  <td><span class="ox-api-entry__member-kind">constructor</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">constructor(options: TranslationAdapterFactoryOptions)</code></td>
  <td><div class="ox-api-entry__member-description">Creates a new instance of DefaultTranslation.</div><ul class="ox-api-entry__member-params"><li><code>options</code> Options for the translation adapter, see <code>TranslationAdapterFactoryOptions</code></li></ul></td>
</tr>
</tbody>
</table>
</div>
<div class="ox-api-entry__member-group">
<h5>Methods</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="method-getresource">
  <td><code>getResource</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">getResource(locale: string): Record&lt;string, string&gt; | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Get a resource of locale.</div><ul class="ox-api-entry__member-params"><li><code>locale</code> A locale of resource (BCP 47 language tag)</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> A resource of locale. If resource not found, return <code>undefined</code>.</div></td>
</tr>
<tr id="method-setresource">
  <td><code>setResource</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">setResource(locale: string, resource: Record&lt;string, string&gt;): void</code></td>
  <td><div class="ox-api-entry__member-description">Set a resource of locale.</div><ul class="ox-api-entry__member-params"><li><code>locale</code> A locale of resource (BCP 47 language tag)</li><li><code>resource</code> A resource of locale</li></ul></td>
</tr>
<tr id="method-getmessage">
  <td><code>getMessage</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">getMessage(locale: string, key: string): string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Get a message of locale.</div><ul class="ox-api-entry__member-params"><li><code>locale</code> A locale of message (BCP 47 language tag)</li><li><code>key</code> A key of message resource</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> A message of locale. If message not found, return <code>undefined</code>.</div></td>
</tr>
<tr id="method-translate">
  <td><code>translate</code></td>
  <td><span class="ox-api-entry__member-kind">method</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">translate(locale: string, key: string, values?: Record&lt;string, unknown&gt;): string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Translate a message.</div><ul class="ox-api-entry__member-params"><li><code>locale</code> A locale of message (BCP 47 language tag)</li><li><code>key</code> A key of message resource</li><li><code>values</code> A values to interpolate in the message - optional</li></ul><div class="ox-api-entry__member-return"><span>Returns</span> A translated message, if message is not translated, return <code>undefined</code>.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
