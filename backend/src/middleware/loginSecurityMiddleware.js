const security = require("../services/loginSecurityService");

function sendUnavailable(res) {
  return res.status(503).json({
    success: false,
    code: "LOGIN_SECURITY_UNAVAILABLE",
    message: "Perlindungan login sementara tidak tersedia. Silakan coba lagi.",
  });
}

function loginThrottle(type) {
  return async (req, res, next) => {
    res.set("Cache-Control", "no-store");
    try {
      const keys = security.buildKeys(req, type);
      const state = await security.checkLimit(keys);
      if (state && state.allowed === false) {
        const retryAfter = Math.max(1, Number(state.retry_after) || security.BLOCK_SECONDS);
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          code: "LOGIN_TEMPORARILY_BLOCKED",
          retry_after: retryAfter,
          message: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${retryAfter} detik.`,
        });
      }
      req.loginSecurity = { keys };
      return next();
    } catch (error) {
      console.error("Login throttle unavailable:", error.code || error.name);
      return sendUnavailable(res);
    }
  };
}

function requireTurnstile(expectedAction) {
  return async (req, res, next) => {
    const token = req.body?.turnstileToken;
    if (req.body && typeof req.body === "object") delete req.body.turnstileToken;
    try {
      const result = await security.verifyTurnstileToken(
        token,
        security.getClientIp(req),
        expectedAction,
      );
      if (!result.valid) {
        return res.status(400).json({
          success: false,
          code: "TURNSTILE_INVALID",
          message: "Verifikasi keamanan gagal atau kedaluwarsa. Silakan ulangi verifikasi.",
        });
      }
      return next();
    } catch (error) {
      console.error("Turnstile unavailable:", error.code || error.name);
      return sendUnavailable(res);
    }
  };
}

module.exports = { loginThrottle, requireTurnstile };
