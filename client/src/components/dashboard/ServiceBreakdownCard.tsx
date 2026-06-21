import { motion } from "framer-motion";

const services = [
  { name: "EC2", value: "$1,245.90", percent: 40.6 },
  { name: "EKS", value: "$842.30", percent: 27.5 },
  { name: "RDS", value: "$512.65", percent: 16.7 },
  { name: "ECS", value: "$235.40", percent: 7.7 },
  { name: "CloudFront", value: "$132.10", percent: 4.3 },
  { name: "S3", value: "$58.40", percent: 1.9 },
  { name: "Lambda", value: "$26.95", percent: 0.9 },
  { name: "Route53", value: "$14.63", percent: 0.4 },
];

export default function ServiceBreakdownCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Service Breakdown
          </div>

          <div className="analytics-subtitle">
            Cost distribution by AWS service
          </div>
        </div>
      </div>

      <div className="service-list">
        {services.map((service) => (
          <div
            key={service.name}
            className="service-row"
          >
            <div className="service-name">
              {service.name}
            </div>

            <div className="service-bar-wrapper">
              <div
                className="service-bar"
                style={{
                  width: `${service.percent}%`,
                }}
              />
            </div>

            <div className="service-value">
              {service.value}
            </div>

            <div className="service-percent">
              {service.percent}%
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}