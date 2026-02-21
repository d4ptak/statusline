#!/usr/bin/env node

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    let output = '';

    const BLUE = '\x1b[38;5;39m', ORANGE = '\x1b[38;5;215m', GREEN = '\x1b[38;5;34m', CYAN = '\x1b[38;5;73m',
        RED = '\x1b[38;5;203m', YELLOW = '\x1b[38;5;178m', WHITE = '\x1b[38;5;252m', DIM = '\033[2m', RESET = '\x1b[0m'

    // Model label: e.g. "Opus 4.6" from id "claude-opus-4-6"
    const modelId = data.model?.id || '';
    const displayName = data.model?.display_name || 'Claude';
    const versionMatch = modelId.match(/(\d+)-(\d+)$/);
    const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}` : '';
    const modelLabel = version ? `${displayName} ${version}` : displayName;
    const modelColor = displayName.includes('Opus') ? ORANGE : displayName.includes('Sonnet') ? BLUE : displayName.includes('Haiku') ? CYAN : RED;
    output += `${modelColor}${modelLabel}${RESET}`;

    // Progress bar: ●○○○○○○○○○ 8%
    const pct = Math.floor(data.context_window?.used_percentage || 0);
    const filled = Math.round((pct * 10) / 100);
    const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
    const bar = '●'.repeat(filled) + '○'.repeat(10 - filled);
    output += ` | ${barColor}${bar} ${pct}%${RESET}`;

    // Tokens: 16k / 200k
    const inputTokens = data.context_window?.current_usage?.input_tokens || 0;
    const cacheCreationInputTokens = data.context_window?.current_usage?.cache_creation_input_tokens || 0;
    const cacheReadInputTokens = data.context_window?.current_usage?.cache_read_input_tokens || 0;
    const totalTokens = inputTokens + cacheCreationInputTokens + cacheReadInputTokens;
    const contextSize = data.context_window?.context_window_size || 200000;
    const formatK = n => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
    output += ` | ${barColor}${formatK(totalTokens)} / ${formatK(contextSize)}${RESET}`;

    // Duration: 1m 45s
    const durationMs = data.cost?.total_duration_ms || 0;
    const durationSec = Math.floor(durationMs / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    output += ` | ${ORANGE}${mins}m ${secs}s${RESET}`;

    // Agent: e.g. "security-reviewer"
    const agent = data.agent?.name || '-';
    output += ` | ${DIM}Agent:${RESET} ${WHITE}${agent}${RESET}`;

    process.stdout.write(output);
});
