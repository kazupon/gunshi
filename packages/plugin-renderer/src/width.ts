/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * NOTE(kazupon): the columns of the usage are aligned by padding, and padding by `String#length`
 * counts UTF-16 code units, which is not what a terminal draws: a full-width character takes two
 * columns, a combining mark takes none, and a joined emoji takes two however many code points it is
 * written with. The text is walked by grapheme, so that a mark or a joiner is part of the character
 * it belongs to, and each grapheme is measured by the code point it starts with.
 *
 * JavaScript has no `\p{East_Asian_Width=Wide}` escape. Approximate wide columns using Han,
 * Hiragana, Katakana, Hangul, emoji presentation, and fullwidth forms. Katakana script extensions
 * include shared wide characters such as `ー` and `、` whose primary script is Common.
 */
const WIDE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Hangul}\p{Emoji_Presentation}]/u

const ZERO_WIDTH = /[\p{Default_Ignorable_Code_Point}\p{Mn}]/u

function graphemeWidth(codePoint: number): number {
  const ch = String.fromCodePoint(codePoint)
  if (ZERO_WIDTH.test(ch)) {
    return 0
  }
  /**
   * Halfwidth and Fullwidth Forms: only the fullwidth slices are two columns. The halfwidth
   * Katakana and Hangul forms in this block would otherwise match WIDE.
   */
  if (codePoint >= 0xff00 && codePoint <= 0xffef) {
    if (
      (codePoint >= 0xff01 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6)
    ) {
      return 2
    }
    return 1
  }
  return WIDE.test(ch) ? 2 : 1
}

/**
 * NOTE(kazupon): the segmenter is made when a string first needs it, not when the module is loaded.
 * The first `Intl` service of a process starts ICU, which takes milliseconds on Node.js, and every
 * run of a CLI loads this module, while only the usage measures strings. The names, the options and
 * the value symbols of the usage are mostly printable ASCII, where each character is a grapheme of its
 * own and one column wide, so such a string is measured by its length, and needs no segmenter.
 */
let segmenter: Intl.Segmenter | undefined

const PRINTABLE_ASCII = /^[\x20-\x7e]*$/

/**
 * Measure the columns a terminal draws a string in.
 *
 * @param value - A string to measure
 * @returns The number of columns
 */
export function displayWidth(value: string): number {
  if (PRINTABLE_ASCII.test(value)) {
    return value.length
  }
  segmenter ??= new Intl.Segmenter()
  let width = 0
  for (const { segment } of segmenter.segment(value)) {
    width += graphemeWidth(segment.codePointAt(0)!)
  }
  return width
}

/**
 * Pad a string with spaces until it is drawn in the given number of columns.
 *
 * @param value - A string to pad
 * @param width - The number of columns to pad it to
 * @returns The padded string
 */
export function padEndToWidth(value: string, width: number): string {
  const padding = width - displayWidth(value)
  return padding > 0 ? value + ' '.repeat(padding) : value
}
