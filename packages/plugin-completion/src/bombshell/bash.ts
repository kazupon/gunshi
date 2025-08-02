/**
 * @author Bombshell team and Bombshell contributors
 * @license ISC
 *
 * This file is forked from @bombsh/tab
 * https://github.com/bombshell-dev/tab/blob/6c42c55f46157ae97e2c059039e21ee412b48138/src/bash.ts
 *
 * Because JSR cannot resolve the dependency of the `http` protocol.
 * https://github.com/kazupon/gunshi/actions/runs/16289584073/job/45996167304#step:11:1124
 */

import { ShellCompDirective } from './index.ts'

/**
 *
 * @param name
 * @param exec
 */
export function generate(name: string, exec: string): string {
  // Replace '-' and ':' with '_' for variable names
  const nameForVar = name.replace(/[-:]/g, '_')

  // Shell completion directives
  const ShellCompDirectiveError = ShellCompDirective.ShellCompDirectiveError
  const ShellCompDirectiveNoSpace = ShellCompDirective.ShellCompDirectiveNoSpace
  const ShellCompDirectiveNoFileComp = ShellCompDirective.ShellCompDirectiveNoFileComp
  const ShellCompDirectiveFilterFileExt = ShellCompDirective.ShellCompDirectiveFilterFileExt
  const ShellCompDirectiveFilterDirs = ShellCompDirective.ShellCompDirectiveFilterDirs
  const ShellCompDirectiveKeepOrder = ShellCompDirective.ShellCompDirectiveKeepOrder

  return `# bash completion for ${name}

# Define shell completion directives
readonly ShellCompDirectiveError=${ShellCompDirectiveError}
readonly ShellCompDirectiveNoSpace=${ShellCompDirectiveNoSpace}
readonly ShellCompDirectiveNoFileComp=${ShellCompDirectiveNoFileComp}
readonly ShellCompDirectiveFilterFileExt=${ShellCompDirectiveFilterFileExt}
readonly ShellCompDirectiveFilterDirs=${ShellCompDirectiveFilterDirs}
readonly ShellCompDirectiveKeepOrder=${ShellCompDirectiveKeepOrder}

# Function to debug completion
__${nameForVar}_debug() {
    if [[ -n \${BASH_COMP_DEBUG_FILE:-} ]]; then
        echo "$*" >> "\${BASH_COMP_DEBUG_FILE}"
    fi
}

# Function to handle completions
__${nameForVar}_complete() {
    local cur prev words cword
    _get_comp_words_by_ref -n "=:" cur prev words cword

    local requestComp out directive

    # Build the command to get completions
    requestComp="${exec} complete -- \${words[@]:1}"

    # Add an empty parameter if the last parameter is complete
    if [[ -z "$cur" ]]; then
        requestComp="$requestComp ''"
    fi

    # Get completions from the program
    out=$(eval "$requestComp" 2>/dev/null)

    # Extract directive if present
    directive=0
    if [[ "$out" == *:* ]]; then
        directive=\${out##*:}
        out=\${out%:*}
    fi

    # Process completions based on directive
    if [[ $((directive & $ShellCompDirectiveError)) -ne 0 ]]; then
        # Error, no completion
        return
    fi

    # Apply directives
    if [[ $((directive & $ShellCompDirectiveNoSpace)) -ne 0 ]]; then
        compopt -o nospace
    fi
    if [[ $((directive & $ShellCompDirectiveKeepOrder)) -ne 0 ]]; then
        compopt -o nosort
    fi
    if [[ $((directive & $ShellCompDirectiveNoFileComp)) -ne 0 ]]; then
        compopt +o default
    fi

    # Handle file extension filtering
    if [[ $((directive & $ShellCompDirectiveFilterFileExt)) -ne 0 ]]; then
        local filter=""
        for ext in $out; do
            filter="$filter|$ext"
        done
        filter="\\.($filter)"
        compopt -o filenames
        COMPREPLY=( $(compgen -f -X "!$filter" -- "$cur") )
        return
    fi

    # Handle directory filtering
    if [[ $((directive & $ShellCompDirectiveFilterDirs)) -ne 0 ]]; then
        compopt -o dirnames
        COMPREPLY=( $(compgen -d -- "$cur") )
        return
    fi

    # Process completions
    local IFS=$'\\n'
    local tab=$(printf '\\t')

    # Parse completions with descriptions
    local completions=()
    while read -r comp; do
        if [[ "$comp" == *$tab* ]]; then
            # Split completion and description
            local value=\${comp%%$tab*}
            local desc=\${comp#*$tab}
            completions+=("$value")
        else
            completions+=("$comp")
        fi
    done <<< "$out"

    # Return completions
    COMPREPLY=( $(compgen -W "\${completions[*]}" -- "$cur") )
}

# Register completion function
complete -F __${nameForVar}_complete ${name}
`
}
