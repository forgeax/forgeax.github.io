// src/errors.ts
var RemoteError = class extends Error {
  code;
  expected;
  hint;
  detail;
  constructor(args) {
    super(`[RemoteError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "RemoteError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    if (args.detail !== void 0) {
      this.detail = args.detail;
    }
  }
  toJSON() {
    const json = {
      code: this.code,
      expected: this.expected,
      hint: this.hint,
      message: this.message
    };
    return this.detail === void 0 ? json : { ...json, detail: this.detail };
  }
};

export { RemoteError };
