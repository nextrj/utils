// Copyright 2023 the NextRJ organization. All rights reserved. MIT license.

/** Utilities for string.
 *
 * Examples:
 *
 * ```ts
 * import { assertStrictEquals } from "https://deno.land/std@$STD_VERSION/testing/asserts.ts"
 * import { truncate } from "https://deno.land/x/nextrj_utils@$VERSION/string.ts"
 *
 * const source = "z±" // z = 1 byte, ± = 2 bytes"
 * // default truncate by max-byte-length
 * assertStrictEquals(truncate(source, 2), "z")
 * assertStrictEquals(truncate(source, 3), "z±")
 *
 * // truncate by max-code-point-length
 * assertStrictEquals(truncate(source, 1, { byByte: false }), "z")
 * assertStrictEquals(truncate(source, 2, { byByte: false }), "z±")
 *
 * const source = "z中" // z = 1 byte, 中 = 3 bytes"
 * // default truncate by max-byte-length
 * assertStrictEquals(truncate(source, 3), "z")
 * assertStrictEquals(truncate(source, 4), "z中")
 * // truncate by max-code-point-length
 * assertStrictEquals(truncate(source, 1, { byByte: false }), "z")
 * assertStrictEquals(truncate(source, 2, { byByte: false }), "z中")
 *
 * const source = "z🦄" // z = 1 byte, 🦄 = 4 bytes"
 * // default truncate by max-byte-length
 * assertStrictEquals(truncate(source, 4), "z")
 * assertStrictEquals(truncate(source, 5), "z🦄")
 * // truncate by max-code-point-length
 * assertStrictEquals(truncate(source, 1, { byByte: false }), "z")
 * assertStrictEquals(truncate(source, 2, { byByte: false }), "z🦄")
 * ```
 *
 * @module
 */

// only for UTF8 https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
const textEncoder = new TextEncoder()

/** Get the specified `source` string's code-point-length.
 *
 * This is not the same code-unit-length of `String.length` for multi-byte string.
 * See https://blog.bitsrc.io/how-big-is-a-string-ef2af3d222e6
 */
export function codePointLength(source: string): number {
  return [...source].length
}

/** Get the specified `source` string's byte-length. */
export function byteLength(source: string): number {
  return textEncoder.encode(source).length
}

export type TruncateOptions = {
  /** Whether truncate by max-byte-length or max-code-point-length. Defaults is true truncate by max-byte-length. */
  byByte: boolean
}

/** Truncate the specified `source` string to a max-length string.
 * Defaults truncate by max-byte-length.
 *
 * If `options.byByte` is false value, then truncate by max-code-point-length
 * (not the same code-unit-length of `String.length`).
 */
export function truncate(
  source: string,
  maxLen: number,
  options: TruncateOptions = { byByte: true },
): string {
  const maxLength = Math.max(0, maxLen)

  // split source to code array by code-point.
  // don't use `source.split("")` because it use code-unit-length.
  // see https://blog.bitsrc.io/how-big-is-a-string-ef2af3d222e6
  const codes = [...source]
  const codesLen = codes.length

  // truncate it
  if (options.byByte) { // truncate by max-byte-length
    if (codesLen > maxLength || byteLength(source) > maxLength) {
      const ss = []
      let byteCounter = 0
      for (const code of codes) {
        byteCounter += byteLength(code)
        if (byteCounter <= maxLength) ss.push(code)
        else break
      }
      return ss.join("")
    } else return source
  } else { // truncate by max-code-point-length
    if (codesLen > maxLength) return codes.slice(0, maxLength).join("")
    else return source
  }
}