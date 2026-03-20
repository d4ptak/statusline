# statusline

A Node.js CLI utility that generates a colorized status line for Claude Code, displaying session metadata including model information, context window usage, token consumption, and session duration.

## Overview

`statusline` is a command-line tool designed to work with Claude Code environments. It reads structured JSON data from stdin and outputs a formatted, color-coded status line showing:

- **Model**: Claude model variant (Opus, Sonnet, Haiku) and version
- **Context Window**: Visual progress bar with percentage usage
- **Tokens**: Current token usage (input, cache creation, cache read) vs context window size
- **Duration**: Total session duration in minutes and seconds
- **Rate Limits**: Claude.ai rate limit usage for 5-hour and 7-day windows with used percentage and reset countdown

## Features

✨ **Color-coded output** - Different colors for different model families and status indicators
📊 **Visual progress bar** - 10-character progress indicator for context window usage
🎯 **Token tracking** - Displays combined token usage including cache metrics
⏱️ **Session timing** - Shows elapsed session time
📈 **Rate limit tracking** - Display Claude.ai rate limit usage (5-hour and 7-day windows) with used percentage and reset countdown

### Output Example

Basic output:
```
Opus 4.6 | ●●●●●○○○○○ 45% | 16k / 200k | ↓ 16k ↑ 2k | 0m 45s
```

With rate limits:
```
Opus 4.6 | ●●●●●○○○○○ 45% | 16k / 200k | ↓ 16k ↑ 2k | 0m 45s | ●●●●●●○○○○ 60% ↺ 2h 15m | ●●●●●●●○○○ 70% ↺ 3d 5h
```

### Color Scheme

- **Models**: Opus (Cyan), Sonnet (Violet), Haiku (Orange), Others (Red)
- **Progress Bars**: Green (<70%), Yellow (70-89%), Red (≥90%)
- **Tokens**: Cyan (input ↓), Violet (output ↑)
- **Duration**: Blue

## Requirements

- **Node.js**: 14.0.0 or higher (for optional chaining `?.` support)
- **Claude Code**: 2.1.80 or higher (Rate Limits feature introduced in 2.1.80)

## Installation & Configuration

Copy `statusline.js` to your Claude config directory:

```bash
cp statusline.js ~/.claude/statusline.js
```

Then add the following to your Claude Code `settings.json` (typically `~/.claude/settings.json`):

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/statusline.js"
  }
}
```

Claude Code will invoke the command on each status line refresh, passing session metadata as JSON to stdin, and display the output in the status bar.
