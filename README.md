# statusline

A Node.js CLI utility that generates a colorized status line for Claude Code, displaying session metadata including model information, context window usage, token consumption, and session duration.

## Overview

`statusline` is a command-line tool designed to work with Claude Code environments. It reads structured JSON data from stdin and outputs a formatted, color-coded status line showing:

- **Model**: Claude model variant (Opus, Sonnet, Haiku) and version
- **Context Window**: Visual progress bar with percentage usage
- **Tokens**: Current token usage (input, cache creation, cache read) vs context window size
- **Duration**: Total session duration in minutes and seconds
- **Agent**: Name of the running agent (if available)

## Features

✨ **Color-coded output** - Different colors for different model families and status indicators
📊 **Visual progress bar** - 10-character progress indicator for context window usage
🎯 **Token tracking** - Displays combined token usage including cache metrics
⏱️ **Session timing** - Shows elapsed session time
🤖 **Agent identification** - Displays agent name when available

### Output Example

```
Opus 4.6 | ●●●●●○○○○○ 45% | 15k / 200k | 0m 45s | Agent: security-reviewer
```
