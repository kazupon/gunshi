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
 * The ranges below are the East Asian Wide and Fullwidth ones of Unicode, coalesced over the
 * unassigned code points between them.
 */
const WIDE_RANGES: readonly (readonly [number, number])[] = [
  [0x11_00, 0x11_5f],
  [0x23_1a, 0x23_1b],
  [0x23_29, 0x23_2a],
  [0x23_e9, 0x23_ec],
  [0x23_f0, 0x23_f0],
  [0x23_f3, 0x23_f3],
  [0x25_fd, 0x25_fe],
  [0x26_14, 0x26_15],
  [0x26_30, 0x26_37],
  [0x26_48, 0x26_53],
  [0x26_7f, 0x26_7f],
  [0x26_8a, 0x26_8f],
  [0x26_93, 0x26_93],
  [0x26_a1, 0x26_a1],
  [0x26_aa, 0x26_ab],
  [0x26_bd, 0x26_be],
  [0x26_c4, 0x26_c5],
  [0x26_ce, 0x26_ce],
  [0x26_d4, 0x26_d4],
  [0x26_ea, 0x26_ea],
  [0x26_f2, 0x26_f3],
  [0x26_f5, 0x26_f5],
  [0x26_fa, 0x26_fa],
  [0x26_fd, 0x26_fd],
  [0x27_05, 0x27_05],
  [0x27_0a, 0x27_0b],
  [0x27_28, 0x27_28],
  [0x27_4c, 0x27_4c],
  [0x27_4e, 0x27_4e],
  [0x27_53, 0x27_55],
  [0x27_57, 0x27_57],
  [0x27_95, 0x27_97],
  [0x27_b0, 0x27_b0],
  [0x27_bf, 0x27_bf],
  [0x2b_1b, 0x2b_1c],
  [0x2b_50, 0x2b_50],
  [0x2b_55, 0x2b_55],
  [0x2e_80, 0x30_3e],
  [0x30_41, 0x33_ff],
  [0x34_00, 0x4d_bf],
  [0x4e_00, 0xa4_cf],
  [0xa9_60, 0xa9_7f],
  [0xac_00, 0xd7_a3],
  [0xf9_00, 0xfa_ff],
  [0xfe_10, 0xfe_19],
  [0xfe_30, 0xfe_52],
  [0xfe_54, 0xfe_66],
  [0xfe_68, 0xfe_6b],
  [0xff_01, 0xff_60],
  [0xff_e0, 0xff_e6],
  [0x1_6f_e0, 0x1_6f_e4],
  [0x1_6f_f0, 0x1_6f_f1],
  [0x1_70_00, 0x1_8c_d5],
  [0x1_8c_ff, 0x1_8d_08],
  [0x1_af_f0, 0x1_b1_6f],
  [0x1_b1_70, 0x1_b2_ff],
  [0x1_f0_04, 0x1_f0_04],
  [0x1_f0_cf, 0x1_f0_cf],
  [0x1_f1_8e, 0x1_f1_8e],
  [0x1_f1_91, 0x1_f1_9a],
  [0x1_f2_00, 0x1_f3_20],
  [0x1_f3_2d, 0x1_f3_35],
  [0x1_f3_37, 0x1_f3_7c],
  [0x1_f3_7e, 0x1_f3_93],
  [0x1_f3_a0, 0x1_f3_ca],
  [0x1_f3_cf, 0x1_f3_d3],
  [0x1_f3_e0, 0x1_f3_f0],
  [0x1_f3_f4, 0x1_f3_f4],
  [0x1_f3_f8, 0x1_f4_3e],
  [0x1_f4_40, 0x1_f4_40],
  [0x1_f4_42, 0x1_f4_fc],
  [0x1_f4_ff, 0x1_f5_3d],
  [0x1_f5_4b, 0x1_f5_4e],
  [0x1_f5_50, 0x1_f5_67],
  [0x1_f5_7a, 0x1_f5_7a],
  [0x1_f5_95, 0x1_f5_96],
  [0x1_f5_a4, 0x1_f5_a4],
  [0x1_f5_fb, 0x1_f6_4f],
  [0x1_f6_80, 0x1_f6_c5],
  [0x1_f6_cc, 0x1_f6_cc],
  [0x1_f6_d0, 0x1_f6_d2],
  [0x1_f6_d5, 0x1_f6_d7],
  [0x1_f6_dc, 0x1_f6_df],
  [0x1_f6_eb, 0x1_f6_ec],
  [0x1_f6_f4, 0x1_f6_fc],
  [0x1_f7_e0, 0x1_f7_eb],
  [0x1_f7_f0, 0x1_f7_f0],
  [0x1_f9_0c, 0x1_f9_3a],
  [0x1_f9_3c, 0x1_f9_45],
  [0x1_f9_47, 0x1_f9_ff],
  [0x1_fa_70, 0x1_fa_ff],
  [0x2_00_00, 0x2_ff_fd],
  [0x3_00_00, 0x3_ff_fd]
]

/**
 * The format characters that a terminal draws nothing for.
 */
const ZERO_WIDTH_RANGES: readonly (readonly [number, number])[] = [
  [0x20_0b, 0x20_0f],
  [0x20_28, 0x20_2e],
  [0x20_60, 0x20_64],
  [0xfe_ff, 0xfe_ff]
]

function inRanges(codePoint: number, ranges: readonly (readonly [number, number])[]): boolean {
  let low = 0
  let high = ranges.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const [start, end] = ranges[middle]
    if (codePoint < start) {
      high = middle - 1
    } else if (codePoint > end) {
      low = middle + 1
    } else {
      return true
    }
  }
  return false
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
    const codePoint = segment.codePointAt(0)!
    if (inRanges(codePoint, ZERO_WIDTH_RANGES)) {
      continue
    }
    width += inRanges(codePoint, WIDE_RANGES) ? 2 : 1
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
