/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import completion from './completion.ts'
import dryRun from './dryrun.ts'
import globals from './globals.ts'
import defaultRenderer from './renderer.ts'

import type { Plugin } from '../plugin.ts'

export const plugins: Plugin[] = [globals, defaultRenderer, completion, dryRun]
