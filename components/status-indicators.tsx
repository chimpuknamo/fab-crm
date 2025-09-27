"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, Wrench } from "lucide-react"

interface StatusIndicatorProps {
  status: "active" | "beta" | "development"
  label: string
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      borderColor: "border-green-400/20",
      text: "Active",
    },
    beta: {
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/20",
      text: "Beta",
    },
    development: {
      icon: Wrench,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
      text: "In Development",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
      <span className="text-xs text-muted-foreground">• {label}</span>
    </motion.div>
  )
}

interface StatusIndicatorsGroupProps {
  indicators: Array<{
    status: "active" | "beta" | "development"
    label: string
  }>
}

export function StatusIndicatorsGroup({ indicators }: StatusIndicatorsGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {indicators.map((indicator, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: false }}
        >
          <StatusIndicator status={indicator.status} label={indicator.label} />
        </motion.div>
      ))}
    </div>
  )
}
