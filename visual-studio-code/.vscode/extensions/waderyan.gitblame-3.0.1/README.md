# Git Blame

[![Build Status](https://travis-ci.org/Sertion/vscode-gitblame.svg?branch=master)](https://travis-ci.org/Sertion/vscode-gitblame)

See Git Blame information in the status bar for the currently selected line.

![Feature Usage](https://github.com/Sertion/vscode-gitblame/raw/master/images/GitBlamePreview.gif)

# Install

1. Open _Visual Studio Code_
1. Press `Ctrl+Shift+X` or `⇧⌘X`
1. Type `blame`
1. Click install on _Git Blame_

# Configuration

<table>
  <thead>
    <tr>
      <th>Setting</th>
      <th>Type</th>
      <th>Default Value</th>
    </tr>
    <tr>
      <th colspan="3">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>gitblame.commitUrl</code></td>
      <td><code>string</code></td>
      <td><code>"guess"</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <ul>
          <li>Url where you can see the commit by hash</li>
          <li><code>"guess"</code> will try to guess the URL based on your remote origin
            <ul>
              <li>Can only support servers that fulfill the following requirements:
                <ul>
                  <li>Url is https</li>
                  <li>No auth or port required</li>
                </ul>
              </li>
          </ul>
          <li><code>"no"</code> will not guess and will not show a link</li>
          <li>Available tokens:
            <ul>
              <li><code>${hash}</code> - the commit hash</li>
              <li><code>${project.name}</code> - your project name (e.g. <code>https://github.com/user/<strong>project_name</strong>.git</code>)</li>
              <li><code>${project.remote}</code> - the current default remote's URL with the
              protocol, port-specifiers, and trailing <code>.git</code> stripped. (e.g.
              <code>https://<strong>github.com/user/project_name</strong>.git</code>)</li>
            </ul>
          </li>
          <li><em>Example:</em> <code>https://github.com/Sertion/vscode-gitblame/commit/${hash}</code></li>
          <li><em>Example:</em> <code>https://${project.remote}/+/${hash}</code></li>
      </ul>
    </tr>
    <tr>
      <td><code>gitblame.pluralWebPathSubstrings</code></td>
      <td><code>string[]</code></td>
      <td><code>["bitbucket", "atlassian"]</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <ul>
          <li>Will automaticly set <code>gitblame.isWebPathPlural</code> to true whenever it detects any of the strings in the array as part of the git origin URL.
          <li>Ignored when <code>gitblame.isWebPathPlural</code> is set to true.
          <li>Will only impact <code>gitblame.commitUrl</code> when it is set to <code>"guess"</code>.
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>gitblame.isWebPathPlural</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <ul>
          <li>Recommended for BitBucket users.
          <li>Will only impact <code>gitblame.commitUrl</code> when it is set to <code>"guess"</code>.
          <li>When set to <code>true</code> it will set the url will point to <code>commits</code> instead of <code>commit</code>.
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>gitblame.ignoreWhitespace</code></td>
      <td><code>boolean</code></td>
      <td><code>false</code></td>
    </tr>
    <tr>
      <td colspan="3">
        Use the git blame <code>-w</code> flag
      </td>
    </tr>
    <tr>
      <td><code>gitblame.infoMessageFormat</code></td>
      <td><code>string</code></td>
      <td><code>"${commit.hash} ${commit.summary}"</code></td>
    </tr>
    <tr>
      <td colspan="3">
        Message that appears when the <code>gitblame.quickInfo</code> command executes (when you click the status bar message). <a href="#message-tokens">Available tokens</a>.
    </tr>
    <tr>
      <td><code>gitblame.statusBarMessageFormat</code></td>
      <td><code>string</code></td>
      <td><code>"Blame ${author.name} ( ${time.ago} )"</code></td>
    </tr>
    <tr>
      <td colspan="3">
        Message in the status bar about the current line's git blame commit. <a href="#message-tokens">Available tokens</a>.
      </td>
    </tr>
    <tr>
      <td><code>gitblame.statusBarMessageNoCommit</code></td>
      <td><code>string</code></td>
      <td><code>"Not Committed Yet"</code></td>
    </tr>
    <tr>
      <td colspan="3">
        Message in the status bar about the current line when no commit can be found. <em>No available tokens</em>.
      </td>
    </tr>
    <tr>
      <td><code>gitblame.statusBarPositionPriority</code></td>
      <td><code>number</code></td>
      <td><code>undefined</code></td>
    </tr>
    <tr>
      <td colspan="3">
        Priority where the status bar view should be placed. Higher value should be placed further to the left.
      </td>
    </tr>
    <tr>
      <td><code>gitblame.logLevel</code></td>
      <td><code>string[]</code></td>
      <td><code>["info", "error", "command", "critical"]</code></td>
    </tr>
    <tr>
      <td colspan="3">
        <ul>
          <li>An array of levels to log to the extension log.</li>
          <li>Available levels:
            <ul>
              <li><code>"info"</code></li>
              <li><code>"error"</code></li>
              <li><code>"command"</code></li>
              <li><code>"critical"</code></li>
            </ul>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
  </tbody>
</table>

## Message Tokens

| Token | Function | Parameter | Default Value | Description |
|-------|----------|-----------|---------------|-------------|
| `${commit.hash}` | No | - | - | 40-bit hash unique to the commit |
| `${commit.hash_short,length}` | Yes | `length` | 7 | the first `length` characters of the 40-bit hash unique to the commit |
| `${commit.summary}` | No | - | - | the first line of the commit message |
| `${author.name}` | No | - | - | the commit author's name |
| `${author.email}` | No | - | - | the commit author's e-mail |
| `${author.timestamp}` | No | - | - | timestamp for the commit author's commit |
| `${author.tz}` | No | - | - | the commit author's time zone |
| `${committer.name}` | No | - | - | the committer's name |
| `${committer.email}` | No | - | - | the committer's e-mail |
| `${committer.timestamp}` | No | - | - | timestamp for the committer's commit |
| `${committer.tz}` | No | - | - | the committer's time zone |
| `${time.ago}` | No | - | - | displays an estimation of how long ago the author committed (e.g. `10 hours ago`, `20 days ago`, `4 months ago`) |
| `${time.c_ago}` | No | - | - | displays an estimation of how long ago the committer committed (e.g. `10 hours ago`, `20 days ago`, `4 months ago`) |

# [Planned Features](https://github.com/Sertion/vscode-gitblame/labels/Planned)

# [Known Issues](https://github.com/Sertion/vscode-gitblame/issues)
