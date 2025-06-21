/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import completion from './completion.ts'
import dryRun from './dryrun.ts'
import globals from './globals.ts'
import i18n from './i18n.ts'
import loader from './loader.ts'
import defaultRenderer from './renderer.ts'

import type { Plugin } from '../plugin.ts'

export const plugins: Plugin[] = [
  globals(),
  i18n(), // TODO: Pass locale and translationAdapterFactory from cli options
  loader(),
  defaultRenderer(),
  completion(),
  dryRun()
] as Plugin[]
