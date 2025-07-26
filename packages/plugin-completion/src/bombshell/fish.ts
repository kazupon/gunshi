/**
 * @author Bombshell team and Bombshell contributors
 * @license ISC
 *
 * This file is forked from @bombsh/tab
 * https://github.com/bombshell-dev/tab/blob/6c42c55f46157ae97e2c059039e21ee412b48138/src/fish.ts
 *
 * Because JSR cannot resolve the dependency of the `http` protocol.
 * https://github.com/kazupon/gunshi/actions/runs/16289584073/job/45996167304#step:11:1124
 */

import { ShellCompDirective } from './index.ts'

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

  return `# fish completion for ${name} -*- shell-script -*-

# Define shell completion directives
set -l ShellCompDirectiveError ${ShellCompDirectiveError}
set -l ShellCompDirectiveNoSpace ${ShellCompDirectiveNoSpace}
set -l ShellCompDirectiveNoFileComp ${ShellCompDirectiveNoFileComp}
set -l ShellCompDirectiveFilterFileExt ${ShellCompDirectiveFilterFileExt}
set -l ShellCompDirectiveFilterDirs ${ShellCompDirectiveFilterDirs}
set -l ShellCompDirectiveKeepOrder ${ShellCompDirectiveKeepOrder}

function __${nameForVar}_debug
    set -l file "$BASH_COMP_DEBUG_FILE"
    if test -n "$file"
        echo "$argv" >> $file
    end
end

function __${nameForVar}_perform_completion
    __${nameForVar}_debug "Starting __${nameForVar}_perform_completion"

    # Extract all args except the completion flag
    set -l args (string match -v -- "--completion=" (commandline -opc))

    # Extract the current token being completed
    set -l current_token (commandline -ct)

    # Check if current token starts with a dash
    set -l flag_prefix ""
    if string match -q -- "-*" $current_token
        set flag_prefix "--flag="
    end

    __${nameForVar}_debug "Current token: $current_token"
    __${nameForVar}_debug "All args: $args"

    # Call the completion program and get the results
    set -l requestComp "${exec} complete -- $args"
    __${nameForVar}_debug "Calling $requestComp"
    set -l results (eval $requestComp 2> /dev/null)

    # Some programs may output extra empty lines after the directive.
    # Let's ignore them or else it will break completion.
    # Ref: https://github.com/spf13/cobra/issues/1279
    for line in $results[-1..1]
        if test (string sub -s 1 -l 1 -- $line) = ":"
            # The directive
            set -l directive (string sub -s 2 -- $line)
            set -l directive_num (math $directive)
            break
        end
    end

    # No directive specified, use default
    if not set -q directive_num
        set directive_num 0
    end

    __${nameForVar}_debug "Directive: $directive_num"

    # Process completions based on directive
    if test $directive_num -eq $ShellCompDirectiveError
        # Error code. No completion.
        __${nameForVar}_debug "Received error directive: aborting."
        return 1
    end

    # Filter out the directive (last line)
    if test (count $results) -gt 0 -a (string sub -s 1 -l 1 -- $results[-1]) = ":"
        set results $results[1..-2]
    end

    # No completions, let fish handle file completions unless forbidden
    if test (count $results) -eq 0
        if test $directive_num -ne $ShellCompDirectiveNoFileComp
            __${nameForVar}_debug "No completions, performing file completion"
            return 1
        end
        __${nameForVar}_debug "No completions, but file completion forbidden"
        return 0
    end

    # Filter file extensions
    if test $directive_num -eq $ShellCompDirectiveFilterFileExt
        __${nameForVar}_debug "File extension filtering"
        set -l file_extensions
        for item in $results
            if test -n "$item" -a (string sub -s 1 -l 1 -- $item) != "-"
                set -a file_extensions "*$item"
            end
        end
        __${nameForVar}_debug "File extensions: $file_extensions"

        # Use the file extensions as completions
        set -l completions
        for ext in $file_extensions
            # Get all files matching the extension
            set -a completions (string replace -r '^.*/' '' -- $ext)
        end

        for item in $completions
            echo -e "$item\t"
        end
        return 0
    end

    # Filter directories
    if test $directive_num -eq $ShellCompDirectiveFilterDirs
        __${nameForVar}_debug "Directory filtering"
        set -l dirs
        for item in $results
            if test -d "$item"
                set -a dirs "$item/"
            end
        end

        for item in $dirs
            echo -e "$item\t"
        end
        return 0
    end

    # Process remaining completions
    for item in $results
        if test -n "$item"
            # Check if the item has a description
            if string match -q "*\t*" -- "$item"
                set -l completion_parts (string split \t -- "$item")
                set -l comp $completion_parts[1]
                set -l desc $completion_parts[2]

                # Add the completion and description
                echo -e "$comp\t$desc"
            else
                # Add just the completion
                echo -e "$item\t"
            end
        end
    end

    # If directive contains NoSpace, tell fish not to add a space after completion
    if test (math "$directive_num & $ShellCompDirectiveNoSpace") -ne 0
        return 2
    end

    return 0
end

# Set up the completion for the ${name} command
complete -c ${name} -f -a "(eval __${nameForVar}_perform_completion)"
`
}
