let hitCount = 0;   // simple in-memory counter

export default function handler(req, res) {
  hitCount++;

  res.status(200).json({
    success: true,
    message: "UptimeRobot ping received",
    total_hits: hitCount
  });
}
