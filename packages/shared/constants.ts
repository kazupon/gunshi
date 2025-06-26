/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export const COMMON_ARGS = {
  help: {
    type: 'boolean',
    short: 'h',
    description: 'Display this help message'
  },
  version: {
    type: 'boolean',
    short: 'v',
    description: 'Display this version'
  }
} as const
