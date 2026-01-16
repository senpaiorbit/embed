let hitCount = 0;
let lastHitTime = null;

export default function handler(req, res) {
  hitCount++;
  lastHitTime = new Date().toISOString();

  const clientIP =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  const response = {
    status: "ok",
    message: "UptimeRobot hit recorded",
    total_hits: hitCount,
    last_hit_time: lastHitTime,
    your_vercel_region: process.env.VERCEL_REGION || "unknown",
    requester_ip: clientIP,
  };

  res.status(200).json(response);
}
