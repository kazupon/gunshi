/**
 * @author Bombshell team and Bombshell contributors
 * @license ISC
 *
 * This file is forked from @bombsh/tab
 * https://github.com/bombshell-dev/tab/blob/6c42c55f46157ae97e2c059039e21ee412b48138/src/zsh.ts
 *
 * Because JSR cannot resolve the dependency of the `http` protocol.
 * https://github.com/kazupon/gunshi/actions/runs/16289584073/job/45996167304#step:11:1124
 */

import { ShellCompDirective } from './index.ts'

export function generate(name: string, exec: string) {
  return `#compdef ${name}
compdef _${name} ${name}

# zsh completion for ${name} -*- shell-script -*-

__${name}_debug() {
    local file="$BASH_COMP_DEBUG_FILE"
    if [[ -n \${file} ]]; then
        echo "$*" >> "\${file}"
    fi
}

_${name}() {
    local shellCompDirectiveError=${ShellCompDirective.ShellCompDirectiveError}
    local shellCompDirectiveNoSpace=${ShellCompDirective.ShellCompDirectiveNoSpace}
    local shellCompDirectiveNoFileComp=${ShellCompDirective.ShellCompDirectiveNoFileComp}
    local shellCompDirectiveFilterFileExt=${ShellCompDirective.ShellCompDirectiveFilterFileExt}
    local shellCompDirectiveFilterDirs=${ShellCompDirective.ShellCompDirectiveFilterDirs}
    local shellCompDirectiveKeepOrder=${ShellCompDirective.ShellCompDirectiveKeepOrder}

    local lastParam lastChar flagPrefix requestComp out directive comp lastComp noSpace keepOrder
    local -a completions

    __${name}_debug "\\n========= starting completion logic =========="
    __${name}_debug "CURRENT: \${CURRENT}, words[*]: \${words[*]}"

    # The user could have moved the cursor backwards on the command-line.
    # We need to trigger completion from the $CURRENT location, so we need
    # to truncate the command-line ($words) up to the $CURRENT location.
    # (We cannot use $CURSOR as its value does not work when a command is an alias.)
    words=( "\${=words[1,CURRENT]}" )
    __${name}_debug "Truncated words[*]: \${words[*]},"

    lastParam=\${words[-1]}
    lastChar=\${lastParam[-1]}
    __${name}_debug "lastParam: \${lastParam}, lastChar: \${lastChar}"

    # For zsh, when completing a flag with an = (e.g., ${name} -n=<TAB>)
    # completions must be prefixed with the flag
    setopt local_options BASH_REMATCH
    if [[ "\${lastParam}" =~ '-.*=' ]]; then
        # We are dealing with a flag with an =
        flagPrefix="-P \${BASH_REMATCH}"
    fi

    # Prepare the command to obtain completions, ensuring arguments are quoted for eval
    local -a args_to_quote=("\${(@)words[2,-1]}")
    if [ "\${lastChar}" = "" ]; then
        # If the last parameter is complete (there is a space following it)
        # We add an extra empty parameter so we can indicate this to the go completion code.
        __${name}_debug "Adding extra empty parameter"
        args_to_quote+=("")
    fi

    # Use Zsh's (q) flag to quote each argument safely for eval
    local quoted_args=("\${(@q)args_to_quote}")

    # Join the main command and the quoted arguments into a single string for eval
    requestComp="${exec} complete -- \${quoted_args[*]}"

    __${name}_debug "About to call: eval \${requestComp}"

    # Use eval to handle any environment variables and such
    out=$(eval \${requestComp} 2>/dev/null)
    __${name}_debug "completion output: \${out}"

    # Extract the directive integer following a : from the last line
    local lastLine
    while IFS='\n' read -r line; do
        lastLine=\${line}
    done < <(printf "%s\n" "\${out[@]}")
    __${name}_debug "last line: \${lastLine}"

    if [ "\${lastLine[1]}" = : ]; then
        directive=\${lastLine[2,-1]}
        # Remove the directive including the : and the newline
        local suffix
        (( suffix=\${#lastLine}+2))
        out=\${out[1,-$suffix]}
    else
        # There is no directive specified.  Leave $out as is.
        __${name}_debug "No directive found.  Setting to default"
        directive=0
    fi

    __${name}_debug "directive: \${directive}"
    __${name}_debug "completions: \${out}"
    __${name}_debug "flagPrefix: \${flagPrefix}"

    if [ $((directive & shellCompDirectiveError)) -ne 0 ]; then
        __${name}_debug "Completion received error. Ignoring completions."
        return
    fi

    local activeHelpMarker="%"
    local endIndex=\${#activeHelpMarker}
    local startIndex=$((\${#activeHelpMarker}+1))
    local hasActiveHelp=0
    while IFS='\n' read -r comp; do
        # Check if this is an activeHelp statement (i.e., prefixed with $activeHelpMarker)
        if [ "\${comp[1,$endIndex]}" = "$activeHelpMarker" ];then
            __${name}_debug "ActiveHelp found: $comp"
            comp="\${comp[$startIndex,-1]}"
            if [ -n "$comp" ]; then
                compadd -x "\${comp}"
                __${name}_debug "ActiveHelp will need delimiter"
                hasActiveHelp=1
            fi
            continue
        fi

        if [ -n "$comp" ]; then
            # If requested, completions are returned with a description.
            # The description is preceded by a TAB character.
            # For zsh's _describe, we need to use a : instead of a TAB.
            # We first need to escape any : as part of the completion itself.
            comp=\${comp//:/\\:}

            local tab="$(printf '\\t')"
            comp=\${comp//$tab/:}

            __${name}_debug "Adding completion: \${comp}"
            completions+=\${comp}
            lastComp=$comp
        fi
    done < <(printf "%s\n" "\${out[@]}")

    # Add a delimiter after the activeHelp statements, but only if:
    # - there are completions following the activeHelp statements, or
    # - file completion will be performed (so there will be choices after the activeHelp)
    if [ $hasActiveHelp -eq 1 ]; then
        if [ \${#completions} -ne 0 ] || [ $((directive & shellCompDirectiveNoFileComp)) -eq 0 ]; then
            __${name}_debug "Adding activeHelp delimiter"
            compadd -x "--"
            hasActiveHelp=0
        fi
    fi

    if [ $((directive & shellCompDirectiveNoSpace)) -ne 0 ]; then
        __${name}_debug "Activating nospace."
        noSpace="-S ''"
    fi

    if [ $((directive & shellCompDirectiveKeepOrder)) -ne 0 ]; then
        __${name}_debug "Activating keep order."
        keepOrder="-V"
    fi

    if [ $((directive & shellCompDirectiveFilterFileExt)) -ne 0 ]; then
        # File extension filtering
        local filteringCmd
        filteringCmd='_files'
        for filter in \${completions[@]}; do
            if [ \${filter[1]} != '*' ]; then
                # zsh requires a glob pattern to do file filtering
                filter="\\*.$filter"
            fi
            filteringCmd+=" -g $filter"
        done
        filteringCmd+=" \${flagPrefix}"

        __${name}_debug "File filtering command: $filteringCmd"
        _arguments '*:filename:'"$filteringCmd"
    elif [ $((directive & shellCompDirectiveFilterDirs)) -ne 0 ]; then
        # File completion for directories only
        local subdir
        subdir="\${completions[1]}"
        if [ -n "$subdir" ]; then
            __${name}_debug "Listing directories in $subdir"
            pushd "\${subdir}" >/dev/null 2>&1
        else
            __${name}_debug "Listing directories in ."
        fi

        local result
        _arguments '*:dirname:_files -/'" \${flagPrefix}"
        result=$?
        if [ -n "$subdir" ]; then
            popd >/dev/null 2>&1
        fi
        return $result
    else
        __${name}_debug "Calling _describe"
        if eval _describe $keepOrder "completions" completions -Q \${flagPrefix} \${noSpace}; then
            __${name}_debug "_describe found some completions"

            # Return the success of having called _describe
            return 0
        else
            __${name}_debug "_describe did not find completions."
            __${name}_debug "Checking if we should do file completion."
            if [ $((directive & shellCompDirectiveNoFileComp)) -ne 0 ]; then
                __${name}_debug "deactivating file completion"

                # We must return an error code here to let zsh know that there were no
                # completions found by _describe; this is what will trigger other
                # matching algorithms to attempt to find completions.
                # For example zsh can match letters in the middle of words.
                return 1
            else
                # Perform file completion
                __${name}_debug "Activating file completion"

                # We must return the result of this command, so it must be the
                # last command, or else we must store its result to return it.
                _arguments '*:filename:_files'" \${flagPrefix}"
            fi
        fi
    fi
}

# don't run the completion function when being sourced or eval-ed
if [ "\${funcstack[1]}" = "_${name}" ]; then
    _${name}
fi
`
}
