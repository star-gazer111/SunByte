// Global Buffer polyfill for extension
// This needs to be loaded before any other modules that use Buffer

// Define Buffer on the global object first
const globalBuffer = {
  from: function(data, encoding) {
    if (typeof data === 'string') {
      return { toString: () => data, length: data.length };
    }
    return { toString: () => '', length: 0 };
  },

  alloc: function(size, fill) {
    return {
      length: size,
      toString: () => fill ? fill.toString().repeat(size) : '',
      fill: function(value) { return this; }
    };
  },

  concat: function(buffers) {
    return {
      length: buffers.reduce((sum, buf) => sum + buf.length, 0),
      toString: () => buffers.map(buf => buf.toString()).join('')
    };
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.Buffer = globalBuffer;
}

if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = globalBuffer;
}

if (typeof global !== 'undefined') {
  global.Buffer = globalBuffer;
}

if (typeof self !== 'undefined') {
  self.Buffer = globalBuffer;
}

export default globalBuffer;
