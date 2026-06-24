SELECT
  service_name,
  COUNT(*) as snapshots
FROM "ServiceCostSnapshot"
GROUP BY service_name
ORDER BY snapshots DESC;
