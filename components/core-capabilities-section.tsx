"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { StatusIndicatorsGroup } from "@/components/status-indicators"
import { useLanguage } from "@/contexts/language-context"
import {
  Brain,
  Building2,
  Target,
  Gamepad2,
  Wifi,
  Shield,
  Users,
  TrendingUp,
  Star,
  Zap,
  Database,
  BarChart,
} from "lucide-react"

// Create capabilities configuration function that uses translations
const createCapabilities = (t: (key: string) => string) => [
  {
    id: "aivy",
    title: t("capabilities.aivy.title"),
    subtitle: t("capabilities.aivy.subtitle"),
    description: t("capabilities.aivy.description"),
    icon: <Brain className="w-8 h-8" />,
    features: [
      { icon: <Users className="w-5 h-5" />, text: t("capabilities.aivy.features.personalized_support") },
      { icon: <Target className="w-5 h-5" />, text: t("capabilities.aivy.features.lesson_planning") },
      { icon: <Zap className="w-5 h-5" />, text: t("capabilities.aivy.features.content_creation") },
      { icon: <BarChart className="w-5 h-5" />, text: t("capabilities.aivy.features.analytics_insights") },
    ],
    stats: [
      { label: t("capabilities.aivy.stats.time_saved"), value: "85%" },
      { label: t("capabilities.aivy.stats.engagement"), value: "92%" },
      { label: t("capabilities.aivy.stats.accuracy"), value: "97%" },
    ],
    technologies: ["Python", "TensorFlow", "OpenAI", "PostgreSQL", "Redis"],
    statusIndicators: [
      { status: "active" as const, label: t("status.active") },
      { status: "beta" as const, label: t("status.beta") },
      { status: "development" as const, label: t("status.development") },
    ],
    gradient: "from-fabriiq-primary via-fabriiq-teal to-fabriiq-primary",
    bgGradient: "from-fabriiq-primary/20 via-fabriiq-teal/10 to-fabriiq-primary/20",
    accentColor: "text-fabriiq-primary",
  },
  {
    id: "operations",
    title: t("capabilities.operations.title"),
    subtitle: t("capabilities.operations.subtitle"),
    description: t("capabilities.operations.description"),
    icon: <Building2 className="w-8 h-8" />,
    features: [
      { icon: <Zap className="w-5 h-5" />, text: t("capabilities.operations.features.enrollment_workflows") },
      { icon: <Database className="w-5 h-5" />, text: t("capabilities.operations.features.financial_management") },
      { icon: <BarChart className="w-5 h-5" />, text: t("capabilities.operations.features.attendance_analytics") },
      { icon: <TrendingUp className="w-5 h-5" />, text: t("capabilities.operations.features.reporting_dashboards") },
    ],
    stats: [
      { label: t("capabilities.operations.stats.admin_reduction"), value: "75%" },
      { label: t("capabilities.operations.stats.data_accuracy"), value: "90%" },
      { label: t("capabilities.operations.stats.system_uptime"), value: "99.9%" },
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Docker"],
    statusIndicators: [
      { status: "active" as const, label: t("status.active") },
      { status: "beta" as const, label: t("status.beta") },
      { status: "development" as const, label: t("status.development") },
    ],
    gradient: "from-fabriiq-teal via-fabriiq-primary to-fabriiq-teal",
    bgGradient: "from-fabriiq-teal/20 via-fabriiq-primary/10 to-fabriiq-teal/20",
    accentColor: "text-fabriiq-teal",
  },
  {
    id: "pedagogy",
    title: t("capabilities.pedagogy.title"),
    subtitle: t("capabilities.pedagogy.subtitle"),
    description: t("capabilities.pedagogy.description"),
    icon: <Target className="w-8 h-8" />,
    features: [
      { icon: <Brain className="w-5 h-5" />, text: t("capabilities.pedagogy.features.cognitive_classification") },
      { icon: <TrendingUp className="w-5 h-5" />, text: t("capabilities.pedagogy.features.mastery_tracking") },
      { icon: <BarChart className="w-5 h-5" />, text: t("capabilities.pedagogy.features.progression_analytics") },
      { icon: <Target className="w-5 h-5" />, text: t("capabilities.pedagogy.features.intervention_engine") },
    ],
    stats: [
      { label: t("capabilities.pedagogy.stats.outcome_improvement"), value: "89%" },
      { label: t("capabilities.pedagogy.stats.teacher_satisfaction"), value: "94%" },
      { label: t("capabilities.pedagogy.stats.faster_mastery"), value: "78%" },
    ],
    technologies: ["Python", "scikit-learn", "D3.js", "React", "GraphQL"],
    statusIndicators: [
      { status: "active" as const, label: t("status.active") },
      { status: "beta" as const, label: t("status.beta") },
      { status: "development" as const, label: t("status.development") },
    ],
    gradient: "from-primary via-fabriiq-primary to-primary",
    bgGradient: "from-primary/20 via-fabriiq-primary/10 to-primary/20",
    accentColor: "text-primary",
  },
]

export function CoreCapabilitiesSection() {
  const [activeCapability, setActiveCapability] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const capabilityRefs = useRef<(HTMLDivElement | null)[]>([])
  const { t } = useLanguage()
  
  // Get dynamic capabilities with translations
  const capabilities = createCapabilities(t)

  // Intersection observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = capabilityRefs.current.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              setActiveCapability(index)
            }
          }
        })
      },
      { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" },
    )

    capabilityRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToCapability = (index: number) => {
    capabilityRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  return (
    <section ref={containerRef} className="relative py-20 px-4 sm:px-6 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(90,138,132,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(31,80,75,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Dot Navigation - Left Side */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20 hidden lg:block">
        <div className="flex flex-col space-y-4">
          {capabilities.map((capability, index) => (
            <button
              key={capability.id}
              onClick={() => scrollToCapability(index)}
              className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
                activeCapability === index
                  ? "bg-fabriiq-primary scale-125 shadow-lg"
                  : "bg-white/30 hover:bg-fabriiq-primary/60 hover:scale-110"
              }`}
            >
              {/* Tooltip */}
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap border border-fabriiq-primary/20">
                  {capability.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 bg-fabriiq-primary/10 rounded-full border border-fabriiq-primary/20 mb-6 backdrop-blur-sm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="w-2 h-2 bg-fabriiq-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-fabriiq-primary">{t("capabilities.title")}</span>
          </motion.div>

          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            <span className="text-white">{t("capabilities.subtitle")} </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("capabilities.description")}
            Comprehensive solutions designed to transform educational institutions and enhance learning outcomes
          </p>
        </motion.div>

        <div className="relative">
          {/* Capabilities Content */}
          <div className="space-y-32">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.id}
                ref={(el) => (capabilityRefs.current[index] = el)}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: false, amount: 0.3 }}
                className="min-h-[80vh] flex items-center"
              >
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Content */}
                  <motion.div
                    className={`space-y-8 ${index % 2 === 1 ? "lg:order-2" : ""}`}
                    initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                  >
                    <div>
                      <motion.div
                        className={`inline-flex items-center space-x-3 px-4 py-2 bg-gradient-to-r ${capability.bgGradient} rounded-full border border-white/10 mb-6`}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                      >
                        <div className={capability.accentColor}>{capability.icon}</div>
                        <span className={`text-sm font-medium ${capability.accentColor}`}>{capability.subtitle}</span>
                      </motion.div>

                      <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                        {capability.title}
                      </h3>

                      <p className="text-lg text-gray-300 leading-relaxed mb-8">{capability.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      {capability.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: featureIndex * 0.1 }}
                          viewport={{ once: false }}
                          className="flex items-center space-x-3"
                        >
                          <div className={capability.accentColor}>{feature.icon}</div>
                          <span className="text-gray-300">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {capability.stats.map((stat, statIndex) => (
                        <motion.div
                          key={statIndex}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: statIndex * 0.1 }}
                          viewport={{ once: false }}
                          className={`text-center p-4 bg-gradient-to-br ${capability.bgGradient} rounded-xl border border-white/10`}
                        >
                          <div className={`text-2xl font-bold ${capability.accentColor} mb-1`}>{stat.value}</div>
                          <div className="text-xs text-gray-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Status Indicators - Replacing Technologies */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Development Status</h4>
                      <StatusIndicatorsGroup indicators={capability.statusIndicators} />
                    </div>

                    {/* Technologies */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {capability.technologies.map((tech, techIndex) => (
                          <motion.div
                            key={techIndex}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: techIndex * 0.05 }}
                            viewport={{ once: false }}
                          >
                            <Badge
                              className={`bg-gradient-to-r ${capability.bgGradient} ${capability.accentColor} border-white/20 hover:border-white/30`}
                            >
                              {tech}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Visual Placeholder - Can be enhanced with actual UI graphics */}
                  <motion.div
                    className={`${index % 2 === 1 ? "lg:order-1" : ""}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                  >
                    <div
                      className={`relative h-96 bg-gradient-to-br ${capability.bgGradient} rounded-2xl border border-white/10 flex items-center justify-center`}
                    >
                      <div className={`${capability.accentColor} opacity-20`}>{capability.icon}</div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-semibold mb-2">{capability.title}</h4>
                        <p className="text-gray-300 text-sm">{capability.subtitle}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
