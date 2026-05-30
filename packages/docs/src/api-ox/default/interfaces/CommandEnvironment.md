# CommandEnvironment

<div id="commandenvironment" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command environment.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandEnvironment&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L158-L262" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-cwd">
  <td><code>cwd</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Current working directory.</div></td>
</tr>
<tr id="property-name">
  <td><code>name</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Command name.</div></td>
</tr>
<tr id="property-description">
  <td><code>description</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Command description.</div></td>
</tr>
<tr id="property-version">
  <td><code>version</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Command version.</div></td>
</tr>
<tr id="property-leftmargin">
  <td><code>leftMargin</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">number</code></td>
  <td><div class="ox-api-entry__member-description">Left margin of the command output.</div></td>
</tr>
<tr id="property-middlemargin">
  <td><code>middleMargin</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">number</code></td>
  <td><div class="ox-api-entry__member-description">Middle margin of the command output.</div></td>
</tr>
<tr id="property-usageoptiontype">
  <td><code>usageOptionType</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the usage option type.</div></td>
</tr>
<tr id="property-usageoptionvalue">
  <td><code>usageOptionValue</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the option value.</div></td>
</tr>
<tr id="property-usagesilent">
  <td><code>usageSilent</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the command usage.</div></td>
</tr>
<tr id="property-subcommands">
  <td><code>subCommands</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Map&lt;string, Command&lt;any&gt; | LazyCommand&lt;any&gt;&gt; | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Sub commands.</div></td>
</tr>
<tr id="property-renderusage">
  <td><code>renderUsage</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Render function the command usage.</div></td>
</tr>
<tr id="property-renderheader">
  <td><code>renderHeader</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Render function the header section in the command usage.</div></td>
</tr>
<tr id="property-rendervalidationerrors">
  <td><code>renderValidationErrors</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Render function the validation errors.</div></td>
</tr>
<tr id="property-onbeforecommand">
  <td><code>onBeforeCommand</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs before any command execution</div></td>
</tr>
<tr id="property-onaftercommand">
  <td><code>onAfterCommand</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs after successful command execution</div></td>
</tr>
<tr id="property-onerrorcommand">
  <td><code>onErrorCommand</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs when a command throws an error</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command environments.</span></li></ul>
</div>
</div>
