/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import completion from './completion.ts'
import dryRun from './dryrun.ts'
import globals from './globals.ts'

export const plugins = [globals, completion, dryRun]
