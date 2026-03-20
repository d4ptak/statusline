#!/usr/bin/env node

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    let output = '';

    const BLUE = '\x1b[38;5;39m', ORANGE = '\x1b[38;5;215m', GREEN = '\x1b[38;5;34m',
        CYAN = '\x1b[38;5;73m', VIOLET = '\x1b[38;5;99m', RED = '\x1b[38;5;203m',
        YELLOW = '\x1b[38;5;178m', RESET = '\x1b[0m'

    const barColor = (pct) => pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
    const bar = (pct) => {
        const filled = Math.round((pct * 10) / 100);
        return '●'.repeat(filled) + '○'.repeat(10 - filled);
    };

    // Model: e.g. "Opus 4.6"
    const model = data.model?.display_name || 'Claude';
    const modelColor = model.includes('Opus') ? CYAN : model.includes('Sonnet') ? VIOLET : model.includes('Haiku') ? ORANGE : RED;
    output += `${modelColor}${model}${RESET}`;

    // Context window: ●○○○○○○○○○ 8%
    const pct = Math.floor(data.context_window?.used_percentage || 0);
    output += ` | ${barColor(pct)}${bar(pct)} ${pct}%${RESET}`;

    // Tokens: 16k / 200k | ↓ 37k ↑ 202
    const inputTokens = data.context_window?.current_usage?.input_tokens || 0;
    const cacheCreationInputTokens = data.context_window?.current_usage?.cache_creation_input_tokens || 0;
    const cacheReadInputTokens = data.context_window?.current_usage?.cache_read_input_tokens || 0;
    const outputTokens = data.context_window?.current_usage?.output_tokens || 0;
    const totalTokens = inputTokens + cacheCreationInputTokens + cacheReadInputTokens;
    const contextSize = data.context_window?.context_window_size || 200000;
    const formatK = n => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
    output += ` | ${barColor(pct)}${formatK(totalTokens)} / ${formatK(contextSize)}${RESET}`;
    if (data.context_window?.current_usage) {
        output += ` | ${CYAN}↓ ${formatK(totalTokens)}${RESET} ${VIOLET}↑ ${formatK(outputTokens)}${RESET}`;
    }

    // Duration: 1m 45s
    const durationMs = data.cost?.total_duration_ms || 0;
    const durationSec = Math.floor(durationMs / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    output += ` | ${BLUE}${mins}m ${secs}s${RESET}`;

    // Rate limits: ○○○○○○○○○○ 4% ↺ 3h | ●●●●●●●●●● 98% ↺ 1h
    const fiveHour = data.rate_limits?.five_hour;
    const sevenDay = data.rate_limits?.seven_day;
    if (fiveHour || sevenDay) {
        const formatReset = (epochSec, withDays = false) => {
            const diffMs = epochSec * 1000 - Date.now();
            if (diffMs <= 0) return 'now';
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 60) return `${diffMin}m`;
            const totalH = Math.floor(diffMin / 60), m = diffMin % 60;
            if (withDays && totalH >= 24) {
                const d = Math.floor(totalH / 24), h = totalH % 24;
                return h > 0 ? (m > 0 ? `${d}d ${h}h ${m}m` : `${d}d ${h}h`) : `${d}d`;
            }
            return m > 0 ? `${totalH}h ${m}m` : `${totalH}h`;
        };
        let rateParts = [];
        if (fiveHour) {
            const p = Math.round(fiveHour.used_percentage);
            const reset = formatReset(fiveHour.resets_at);
            rateParts.push(` | ${barColor(p)}${bar(p)} ${p}% ↺ ${reset}${RESET}`);
        }
        if (sevenDay) {
            const p = Math.round(sevenDay.used_percentage);
            const reset = formatReset(sevenDay.resets_at, true);
            rateParts.push(` | ${barColor(p)}${bar(p)} ${p}% ↺ ${reset}${RESET}`);
        }
        output += `${rateParts.join('')}`;
    }

    process.stdout.write(output);
});