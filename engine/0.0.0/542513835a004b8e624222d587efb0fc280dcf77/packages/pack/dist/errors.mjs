// src/errors.ts
var PackError = class extends Error {
  code;
  expected;
  hint;
  detail;
  cause;
  constructor(args) {
    super(`[PackError ${args.code}] expected: ${args.expected}; hint: ${args.hint}`);
    this.name = "PackError";
    this.code = args.code;
    this.expected = args.expected;
    this.hint = args.hint;
    this.detail = args.detail;
    if (args.cause !== void 0) this.cause = args.cause;
  }
};

export { PackError };
