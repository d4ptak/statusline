#!/usr/bin/env bash

input=$(cat)

BLUE=$'\e[38;5;39m'
ORANGE=$'\e[38;5;215m'
GREEN=$'\e[38;5;34m'
CYAN=$'\e[38;5;73m'
VIOLET=$'\e[38;5;99m'
RED=$'\e[38;5;203m'
YELLOW=$'\e[38;5;178m'
RESET=$'\e[0m'

bar_color() {
    local p=$1
    if   [ "$p" -ge 90 ]; then printf '%s' "$RED"
    elif [ "$p" -ge 70 ]; then printf '%s' "$YELLOW"
    else                       printf '%s' "$GREEN"
    fi
}

bar() {
    local filled=$(( ($1 * 10 + 50) / 100 )) s="" i
    for ((i=0; i<filled; i++));  do s+="●"; done
    for ((i=filled; i<10; i++)); do s+="○"; done
    printf '%s' "$s"
}

format_k() {
    if [ "$1" -ge 1000 ]; then printf '%s' "$(( ($1 + 500) / 1000 ))k"
    else printf '%s' "$1"
    fi
}

format_reset() {
    local epoch_sec=$1 with_days=${2:-0}
    local now_sec diff_sec diff_min total_h m d h
    now_sec=$(date +%s)
    diff_sec=$(( epoch_sec - now_sec ))
    [ "$diff_sec" -le 0 ] && printf 'now' && return
    diff_min=$(( diff_sec / 60 ))
    [ "$diff_min" -lt 60 ] && printf '%sm' "$diff_min" && return
    total_h=$(( diff_min / 60 ))
    m=$(( diff_min % 60 ))
    if [ "$with_days" -eq 1 ] && [ "$total_h" -ge 24 ]; then
        d=$(( total_h / 24 )); h=$(( total_h % 24 ))
        if [ "$h" -gt 0 ]; then
            [ "$m" -gt 0 ] && printf '%sd %sh %sm' "$d" "$h" "$m" && return
            printf '%sd %sh' "$d" "$h"
        else
            printf '%sd' "$d"
        fi
        return
    fi
    [ "$m" -gt 0 ] && printf '%sh %sm' "$total_h" "$m" && return
    printf '%sh' "$total_h"
}

j() { jq -r "$1" <<< "$input"; }

model=$(j '.model.display_name // "Claude"')
pct=$(j '(.context_window.used_percentage // 0) | floor')
input_tokens=$(j '.context_window.current_usage.input_tokens // 0')
cache_creation=$(j '.context_window.current_usage.cache_creation_input_tokens // 0')
cache_read=$(j '.context_window.current_usage.cache_read_input_tokens // 0')
output_tokens=$(j '.context_window.current_usage.output_tokens // 0')
context_size=$(j '.context_window.context_window_size // 200000')
duration_ms=$(j '.cost.total_duration_ms // 0')
has_usage=$(j 'if .context_window.current_usage then "1" else "0" end')
five_hour_pct=$(j 'if .rate_limits.five_hour then (.rate_limits.five_hour.used_percentage | round | tostring) else "" end')
five_hour_resets=$(j '.rate_limits.five_hour.resets_at // ""')
seven_day_pct=$(j 'if .rate_limits.seven_day then (.rate_limits.seven_day.used_percentage | round | tostring) else "" end')
seven_day_resets=$(j '.rate_limits.seven_day.resets_at // ""')

if   [[ "$model" == *"Opus"*   ]]; then mc="$CYAN"
elif [[ "$model" == *"Sonnet"* ]]; then mc="$VIOLET"
elif [[ "$model" == *"Haiku"*  ]]; then mc="$ORANGE"
else mc="$RED"
fi

out="${mc}${model}${RESET}"

bc=$(bar_color "$pct")
out+=" | ${bc}$(bar "$pct") ${pct}%${RESET}"

total_tokens=$(( input_tokens + cache_creation + cache_read ))
out+=" | ${bc}$(format_k "$total_tokens") / $(format_k "$context_size")${RESET}"

if [ "$has_usage" = "1" ]; then
    out+=" | ${CYAN}↓ $(format_k "$total_tokens")${RESET} ${VIOLET}↑ $(format_k "$output_tokens")${RESET}"
fi

duration_sec=$(( duration_ms / 1000 ))
out+=" | ${BLUE}$(( duration_sec / 60 ))m $(( duration_sec % 60 ))s${RESET}"

if [ -n "$five_hour_pct" ]; then
    bc=$(bar_color "$five_hour_pct")
    out+=" | ${bc}$(bar "$five_hour_pct") ${five_hour_pct}% ↺ $(format_reset "$five_hour_resets")${RESET}"
fi
if [ -n "$seven_day_pct" ]; then
    bc=$(bar_color "$seven_day_pct")
    out+=" | ${bc}$(bar "$seven_day_pct") ${seven_day_pct}% ↺ $(format_reset "$seven_day_resets" 1)${RESET}"
fi

printf '%s' "$out"
