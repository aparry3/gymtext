/**
 * Vitest test environment setup
 */

// Silence console.log during tests unless DEBUG is set
if (!process.env.DEBUG) {
  console.log = () => {};
}
