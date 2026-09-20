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
 * JavaScript has no `\p{East_Asian_Width=Wide}` escape. Wide columns are those the engine already
 * classifies as Han / Hiragana / Katakana / Hangul or emoji-presentation, plus the fullwidth slice
 * of Halfwidth and Fullwidth Forms. That covers CLI names; the rest of the East Asian Width table
 * is symbols that do not appear there. Unicode updates then come with the runtime.
 */
const WIDE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Emoji_Presentation}]/u

const ZERO_WIDTH = /[\p{Default_Ignorable_Code_Point}\p{Mn}]/u

function graphemeWidth(codePoint: number): number {
  const ch = String.fromCodePoint(codePoint)
  if (ZERO_WIDTH.test(ch)) {
    return 0
  }
  /**
   * Halfwidth and Fullwidth Forms: only the fullwidth slices are two columns. The rest of the
   * block is halfwidth katakana / hangul, which `\p{Script=Katakana}` and `\p{Script=Hangul}`
   * would otherwise count as wide.
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

const segmenter = new Intl.Segmenter()

/**
 * Measure the columns a terminal draws a string in.
 *
 * @param value - A string to measure
 * @returns The number of columns
 */
export function displayWidth(value: string): number {
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
