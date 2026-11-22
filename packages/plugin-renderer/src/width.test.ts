import { describe, expect, test, vi } from 'vite-plus/test'
import { displayWidth, padEndToWidth } from './width.ts'

describe('displayWidth', () => {
  test('ascii is one column per character', () => {
    expect(displayWidth('build')).toEqual(5)
  })

  test('printable ascii is measured as the segmenter measures it', () => {
    const printable = Array.from({ length: 0x7f - 0x20 }, (_, i) =>
      String.fromCodePoint(0x20 + i)
    ).join('')
    expect(displayWidth(printable)).toEqual(95)
    // the wide character leads the string past printable ascii, to the segmenter
    expect(displayWidth(`配${printable}`)).toEqual(2 + 95)
  })

  test.each([
    ['CJK', '配置', 4],
    ['Hangul', '한국어', 6],
    ['fullwidth latin', 'ＡＢＣ', 6],
    ['katakana with prolonged sound marks', 'サーバー', 8],
    ['ideographic comma', '、', 2],
    ['ideographic full stop', '。', 2],
    ['left corner bracket', '「', 2],
    ['katakana middle dot', '・', 2]
  ])('a wide character takes two columns (%s)', (_, value, width) => {
    expect(displayWidth(value)).toEqual(width)
  })

  test('halfwidth katakana stays one column', () => {
    expect(displayWidth('ｱｲｳ')).toEqual(3)
    expect(displayWidth('ｻｰﾊﾞｰ･､｡｢')).toEqual(8)
  })

  test('the middle dot outside katakana stays one column', () => {
    expect(displayWidth('·')).toEqual(1)
  })

  test('a mix of wide and narrow adds up', () => {
    expect(displayWidth('<オプション>')).toEqual(12)
  })

  test('a combining mark takes no column of its own', () => {
    // `e` + U+0301 is two code units and one column
    expect(displayWidth('café')).toEqual(4)
    expect('café'.length).toEqual(5)
    // a mark with no base is its own grapheme; East Asian Width still draws nothing
    expect(displayWidth('\u0301')).toEqual(0)
    expect(displayWidth('\u0301a')).toEqual(1)
  })

  test('a surrogate pair is one wide character', () => {
    expect(displayWidth('𠮷野家')).toEqual(6)
    expect('𠮷野家'.length).toEqual(4)
  })

  test('a sequence joined with ZWJ is one wide character', () => {
    expect(displayWidth('👨‍👩‍👧‍👦family')).toEqual(8)
  })

  test('a zero width character takes no column', () => {
    expect(displayWidth('a​b')).toEqual(2)
  })

  test('an empty string is no columns', () => {
    expect(displayWidth('')).toEqual(0)
  })
})

describe('the segmenter', () => {
  test('is made when a string that is not printable ascii is measured first, not on load', async () => {
    vi.resetModules()
    const segmenter = vi.spyOn(Intl, 'Segmenter')
    try {
      const width = await import('./width.ts')
      expect(segmenter).not.toHaveBeenCalled()

      expect(width.displayWidth('-n, --name <name>')).toEqual(17)
      expect(width.padEndToWidth('build', 8)).toEqual('build'.padEnd(8))
      expect(segmenter).not.toHaveBeenCalled()

      expect(width.displayWidth('[オプション]')).toEqual(12)
      expect(width.displayWidth('café')).toEqual(4)
      expect(segmenter).toHaveBeenCalledTimes(1)
    } finally {
      segmenter.mockRestore()
    }
  })
})

describe('padEndToWidth', () => {
  test('pads to the width a terminal draws', () => {
    expect(padEndToWidth('配置', 10)).toEqual(`配置${' '.repeat(6)}`)
  })

  test('leaves a value that is already wide enough alone', () => {
    expect(padEndToWidth('配置', 2)).toEqual('配置')
    expect(padEndToWidth('配置', 0)).toEqual('配置')
  })

  test('pads ascii the way `padEnd` does', () => {
    expect(padEndToWidth('build', 8)).toEqual('build'.padEnd(8))
  })
})
