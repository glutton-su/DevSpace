export const validatePassword = (pwd = "") => {
  const minLen = parseInt(process.env.MIN_PASSWORD_LENGTH || "6");
  const uppercase = process.env.REQUIRE_UPPERCASE !== "false";
  const lowercase = process.env.REQUIRE_LOWERCASE !== "false";
  const numbers   = process.env.REQUIRE_NUMBERS   !== "false";
  const special   = process.env.REQUIRE_SPECIAL_CHARS === "true";

  const tests = [
    { valid: pwd.length >= minLen,        msg: `≥${minLen} characters` },
    { valid: !uppercase || /[A-Z]/.test(pwd), msg: "one uppercase letter" },
    { valid: !lowercase || /[a-z]/.test(pwd), msg: "one lowercase letter" },
    { valid: !numbers   || /\d/.test(pwd),    msg: "one number" },
    { valid: !special   || /[^A-Za-z0-9]/.test(pwd), msg: "one special char" },
  ];

  return {
    ok: tests.every((t) => t.valid),
    errors: tests.filter((t) => !t.valid).map((t) => t.msg),
  };
};