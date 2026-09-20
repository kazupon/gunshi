import { describe, expect, test } from 'vitest'
import { displayWidth, padEndToWidth } from './width.ts'

describe('displayWidth', () => {
  test('ascii is one column per character', () => {
    expect(displayWidth('build')).toEqual(5)
  })

  test.each([
    ['CJK', '配置', 4],
    ['Hangul', '한국어', 6],
    ['fullwidth latin', 'ＡＢＣ', 6]
  ])('a wide character takes two columns (%s)', (_, value, width) => {
    expect(displayWidth(value)).toEqual(width)
  })

  test('halfwidth katakana stays one column', () => {
    expect(displayWidth('ｱｲｳ')).toEqual(3)
  })

  test('a mix of wide and narrow adds up', () => {
    expect(displayWidth('<オプション>')).toEqual(12)
  })

  test('a combining mark takes no column of its own', () => {
    // `e` + U+0301 is two code units and one column
    expect(displayWidth('café')).toEqual(4)
    expect('café'.length).toEqual(5)
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
