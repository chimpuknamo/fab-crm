"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Clock,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Brain,
  Building2,
  Target,
  Lightbulb,
  Rocket,
  Shield,
  BookOpen,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react"

export default function PartnershipPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    institutionName: "",
    contactName: "",
    email: "",
    phone: "",
    role: "",
    institutionType: "",
    campusCount: "",
    studentPopulation: "",
    currentSystems: "",
    timeline: "",
    commitment: "",
    customRequirements: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => {
      setIsSubmitted(true)
      setFormData({
        institutionName: "",
        contactName: "",
        email: "",
        phone: "",
        role: "",
        institutionType: "",
        institutionType: "",
        campusCount: "",
        studentPopulation: "",
        currentSystems: "",
        timeline: "",
        commitment: "",
        customRequirements: "",
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(90,138,132,0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 80%, rgba(31,80,75,0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(31,80,75,0.2) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-fabriiq-primary/10 border border-fabriiq-primary/20 text-fabriiq-primary text-sm font-medium">
                <span className="w-2 h-2 bg-fabriiq-primary rounded-full mr-2 animate-pulse"></span>
                {t('partnership.hero.alphaBadge')}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-7xl font-black mb-8 leading-tight text-white"
            >
              {t('partnership.hero.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership.hero.titleHighlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-16"
            >
              {t('partnership.hero.description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative max-w-6xl mx-auto mb-20"
            >
              <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-2 border-fabriiq-primary/30 rounded-3xl p-12 shadow-2xl shadow-fabriiq-primary/10">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-4">
                    <Brain className="w-12 h-12 text-fabriiq-primary" />
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-white">{t('partnership.hero.partnerCardTitle')}</h2>
                      <p className="text-fabriiq-teal">{t('partnership.hero.partnerCardSubtitle')}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xl mb-2">{t('partnership.hero.valueLabel')}</p>
                    <p className="text-4xl font-bold text-fabriiq-primary mb-2">{t('partnership.hero.valueText')}</p>
                    <p className="text-gray-400 text-lg">{t('partnership.hero.valueSubtext')}</p>
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute -top-8 -left-8 transform -rotate-12"
                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                    animate={{ opacity: 1, scale: 1, rotate: -12 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-fabriiq-primary/20 to-fabriiq-teal/20 backdrop-blur-sm border border-fabriiq-primary/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <DollarSign className="w-6 h-6 text-fabriiq-primary" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.strategic.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.strategic.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-fabriiq-primary/20 text-fabriiq-primary border-fabriiq-primary/30">
                        {t('partnership.benefits.strategic.badge')}
                      </Badge>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -top-8 -right-8 transform rotate-12"
                    initial={{ opacity: 0, scale: 0, rotate: 45 }}
                    animate={{ opacity: 1, scale: 1, rotate: 12 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-fabriiq-teal/20 to-fabriiq-primary/20 backdrop-blur-sm border border-fabriiq-teal/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-6 h-6 text-fabriiq-teal" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.codevelopment.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.codevelopment.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-fabriiq-teal/20 text-fabriiq-teal border-fabriiq-teal/30">
                        {t('partnership.benefits.codevelopment.badge')}
                      </Badge>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 -left-12 transform -translate-y-1/2 -rotate-6"
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: -6 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-primary/20 to-fabriiq-primary/20 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <Clock className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.earlyAccess.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.earlyAccess.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30">{t('partnership.benefits.earlyAccess.badge')}</Badge>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 -right-12 transform -translate-y-1/2 rotate-6"
                    initial={{ opacity: 0, scale: 0, rotate: 30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 6 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.aivy.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.aivy.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{t('partnership.benefits.aivy.badge')}</Badge>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-8 -left-8 transform rotate-6"
                    initial={{ opacity: 0, scale: 0, rotate: 30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 6 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="w-6 h-6 text-emerald-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.multiCampus.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.multiCampus.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{t('partnership.benefits.multiCampus.badge')}</Badge>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-8 -right-8 transform -rotate-6"
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: -6 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                  >
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 shadow-lg min-w-[200px]">
                      <div className="flex items-center space-x-3 mb-3">
                        <Award className="w-6 h-6 text-red-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{t('partnership.benefits.ferpa.title')}</h3>
                          <p className="text-sm text-gray-400">{t('partnership.benefits.ferpa.subtitle')}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{t('partnership.benefits.ferpa.badge')}</Badge>
                    </div>
                  </motion.div>
                </div>

                <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-fabriiq-primary/20 to-fabriiq-teal/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-r from-fabriiq-primary/20 to-fabriiq-teal/20 rounded-full blur-3xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership.coCreators.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership.coCreators.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              {t('partnership.coCreators.description')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership.journey.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership.journey.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('partnership.journey.description')}
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-fabriiq-primary to-fabriiq-teal rounded-full"></div>

            <div className="space-y-16">
              {[
                {
                  icon: Target,
                  title: t('partnership_extended.timeline.steps.discovery.title'),
                  description: t('partnership_extended.timeline.steps.discovery.description'),
                  color: "text-fabriiq-primary",
                  bgColor: "from-fabriiq-primary/20 to-fabriiq-teal/10",
                },
                {
                  icon: Users,
                  title: t('partnership_extended.timeline.steps.selection.title'),
                  description: t('partnership_extended.timeline.steps.selection.description'),
                  color: "text-fabriiq-teal",
                  bgColor: "from-fabriiq-teal/20 to-fabriiq-primary/10",
                },
                {
                  icon: Rocket,
                  title: t('partnership_extended.timeline.steps.pilot.title'),
                  description: t('partnership_extended.timeline.steps.pilot.description'),
                  color: "text-primary",
                  bgColor: "from-primary/20 to-fabriiq-primary/10",
                },
                {
                  icon: Brain,
                  title: t('partnership_extended.timeline.steps.partnership.title'),
                  description: t('partnership_extended.timeline.steps.partnership.description'),
                  color: "text-purple-400",
                  bgColor: "from-purple-500/20 to-pink-600/10",
                },
                {
                  icon: Star,
                  title: t('partnership_extended.timeline.steps.sustained.title'),
                  description: t('partnership_extended.timeline.steps.sustained.description'),
                  color: "text-emerald-400",
                  bgColor: "from-emerald-500/20 to-teal-600/10",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className={`p-8 rounded-2xl bg-gradient-to-br ${step.bgColor} border border-white/10`}>
                      <div
                        className={`flex items-center space-x-4 ${index % 2 === 0 ? "flex-row-reverse" : "flex-row"} mb-4`}
                      >
                        <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center`}>
                          <step.icon className={`w-6 h-6 ${step.color}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal border-4 border-black`}
                    ></div>
                  </div>

                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership_extended.investment.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership_extended.investment.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('partnership_extended.investment.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">{t('partnership_extended.investment.institutions.title')}</h3>
              <p className="text-lg text-fabriiq-primary font-semibold text-center mb-6">
                {t('partnership_extended.investment.institutions.subtitle')}
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Zap,
                    title: t('partnership_extended.investment.institutions.benefits.custom_features'),
                    color: "text-fabriiq-primary",
                  },
                  {
                    icon: Clock,
                    title: t('partnership_extended.investment.institutions.benefits.competitive_advantage.title'),
                    description: t('partnership_extended.investment.institutions.benefits.competitive_advantage.description'),
                    color: "text-fabriiq-teal",
                  },
                  {
                    icon: Target,
                    title: t('partnership_extended.investment.institutions.benefits.influence_roadmap'),
                    color: "text-primary",
                  },
                  {
                    icon: Building2,
                    title: t('partnership_extended.investment.institutions.benefits.custom_branding'),
                    color: "text-purple-400",
                  },
                  {
                    icon: Award,
                    title: t('partnership_extended.investment.institutions.benefits.thought_leadership'),
                    color: "text-emerald-400",
                  },
                  {
                    icon: DollarSign,
                    title: t('partnership_extended.investment.institutions.benefits.preferential_pricing'),
                    color: "text-orange-400",
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <p className="text-gray-300">{benefit.title}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-white mb-8 text-center">{t('partnership_extended.investment.fabriiq.title')}</h3>
              <p className="text-lg text-fabriiq-teal font-semibold text-center mb-6">
                {t('partnership_extended.investment.fabriiq.subtitle')}
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: t('partnership_extended.investment.fabriiq.benefits.validation'),
                    color: "text-fabriiq-primary",
                  },
                  {
                    icon: Users,
                    title: t('partnership_extended.investment.fabriiq.benefits.user_input'),
                    color: "text-fabriiq-teal",
                  },
                  {
                    icon: CheckCircle,
                    title: t('partnership_extended.investment.fabriiq.benefits.quality_assurance'),
                    color: "text-primary",
                  },
                  {
                    icon: Lightbulb,
                    title: t('partnership_extended.investment.fabriiq.benefits.use_case_refinement'),
                    color: "text-purple-400",
                  },
                  {
                    icon: TrendingUp,
                    title: t('partnership_extended.investment.fabriiq.benefits.market_validation'),
                    color: "text-emerald-400",
                  },
                  {
                    icon: BookOpen,
                    title: t('partnership_extended.investment.fabriiq.benefits.success_stories'),
                    color: "text-orange-400",
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <p className="text-gray-300">{benefit.title}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership_extended.idealPartner.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership_extended.idealPartner.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('partnership_extended.idealPartner.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Building2 className="w-8 h-8 text-fabriiq-primary mr-3" />
                {t('partnership_extended.idealPartner.institutional.title')}
              </h3>
              <div className="space-y-4">
                {[
                  t('partnership_extended.idealPartner.institutional.items.multi_campus'),
                  t('partnership_extended.idealPartner.institutional.items.progressive_leadership'),
                  t('partnership_extended.idealPartner.institutional.items.technology_readiness'),
                  t('partnership_extended.idealPartner.institutional.items.collaborative_culture'),
                  t('partnership_extended.idealPartner.institutional.items.financial_readiness'),
                ].map((characteristic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-fabriiq-primary mt-1 flex-shrink-0" />
                    <p className="text-gray-300">{characteristic}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="w-8 h-8 text-fabriiq-teal mr-3" />
                {t('partnership_extended.idealPartner.partnership_requirements.title')}
              </h3>
              <div className="space-y-4">
                {[
                  t('partnership_extended.idealPartner.partnership_requirements.items.csuite_commitment'),
                  t('partnership_extended.idealPartner.partnership_requirements.items.staff_allocation'),
                  t('partnership_extended.idealPartner.partnership_requirements.items.investment_deployment'),
                  t('partnership_extended.idealPartner.partnership_requirements.items.reference_willingness'),
                  t('partnership_extended.idealPartner.partnership_requirements.items.research_participation'),
                ].map((requirement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-fabriiq-teal mt-1 flex-shrink-0" />
                    <p className="text-gray-300">{requirement}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership_extended.charter.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership_extended.charter.titleHighlight')}
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Building2 className="w-8 h-8 text-fabriiq-primary mr-3" />
                {t('partnership_extended.charter.institution.title')}
              </h3>
              <div className="space-y-4">
                {[
                  t('partnership_extended.charter.institution.items.cover_deployment'),
                  t('partnership_extended.charter.institution.items.allocate_staff'),
                  t('partnership_extended.charter.institution.items.participate_feedback'),
                  t('partnership_extended.charter.institution.items.provide_assessment'),
                  t('partnership_extended.charter.institution.items.maintain_confidentiality'),
                ].map((commitment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-fabriiq-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-300">{commitment}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-8 h-8 text-fabriiq-teal mr-3" />
                {t('partnership_extended.charter.fabriiq.title')}
              </h3>
              <div className="space-y-4">
                {[
                  t('partnership_extended.charter.fabriiq.items.provide_access'),
                  t('partnership_extended.charter.fabriiq.items.deliver_branding'),
                  t('partnership_extended.charter.fabriiq.items.maintain_communication'),
                  t('partnership_extended.charter.fabriiq.items.honor_terms'),
                  t('partnership_extended.charter.fabriiq.items.recognize_institution'),
                ].map((commitment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-fabriiq-teal rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-300">{commitment}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership.form.header.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership.form.header.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('partnership.form.header.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 sm:p-12"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{t('partnership.form.title')}</h3>
                  <p className="text-gray-400">
                    {t('partnership.form.subtitle')}
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    {t('partnership.form.sections.institution')}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.institutionName')}</label>
                      <Input
                        value={formData.institutionName}
                        onChange={(e) => handleInputChange("institutionName", e.target.value)}
                        placeholder={t('partnership.form.placeholders.institutionName')}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.institutionType')}</label>
                      <Select
                        value={formData.institutionType}
                        onValueChange={(value) => handleInputChange("institutionType", value)}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder={t('partnership.form.placeholders.institutionType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multi-campus-private">{t('partnership.form.options.institutionType.multiCampus')}</SelectItem>
                          <SelectItem value="university">{t('partnership.form.options.institutionType.university')}</SelectItem>
                          <SelectItem value="international-network">{t('partnership.form.options.institutionType.international')}</SelectItem>
                          <SelectItem value="specialized">{t('partnership.form.options.institutionType.specialized')}</SelectItem>
                          <SelectItem value="other">{t('partnership.form.options.institutionType.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.campusCount')}</label>
                      <Input
                        value={formData.campusCount}
                        onChange={(e) => handleInputChange("campusCount", e.target.value)}
                        placeholder={t('partnership.form.placeholders.campusCount')}
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.studentPopulation')}</label>
                      <Input
                        value={formData.studentPopulation}
                        onChange={(e) => handleInputChange("studentPopulation", e.target.value)}
                        placeholder={t('partnership.form.placeholders.studentPopulation')}
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    {t('partnership.form.sections.contact')}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.contactName')}</label>
                      <Input
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        placeholder={t('partnership.form.placeholders.contactName')}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.email')}</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={t('partnership.form.placeholders.email')}
                        required
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.phone')}</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder={t('partnership.form.placeholders.phone')}
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.role')}</label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder={t('partnership.form.placeholders.role')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ceo">{t('partnership.form.options.role.ceo')}</SelectItem>
                          <SelectItem value="cto">{t('partnership.form.options.role.cto')}</SelectItem>
                          <SelectItem value="cao">{t('partnership.form.options.role.cao')}</SelectItem>
                          <SelectItem value="director">{t('partnership.form.options.role.director')}</SelectItem>
                          <SelectItem value="it-director">{t('partnership.form.options.role.itDirector')}</SelectItem>
                          <SelectItem value="other">{t('partnership.form.options.role.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    {t('partnership.form.sections.partnership')}
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('partnership.form.fields.currentSystems')}
                    </label>
                    <Textarea
                      value={formData.currentSystems}
                      onChange={(e) => handleInputChange("currentSystems", e.target.value)}
                      placeholder={t('partnership.form.placeholders.currentSystems')}
                      rows={4}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('partnership.form.fields.timeline')}
                      </label>
                      <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder={t('partnership.form.placeholders.timeline')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">{t('partnership.form.options.timeline.immediate')}</SelectItem>
                          <SelectItem value="short-term">{t('partnership.form.options.timeline.shortTerm')}</SelectItem>
                          <SelectItem value="medium-term">{t('partnership.form.options.timeline.mediumTerm')}</SelectItem>
                          <SelectItem value="strategic">{t('partnership.form.options.timeline.strategic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t('partnership.form.fields.commitment')}
                      </label>
                      <Select
                        value={formData.commitment}
                        onValueChange={(value) => handleInputChange("commitment", value)}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue placeholder={t('partnership.form.placeholders.commitment')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">
                            {t('partnership.form.options.commitment.full')}
                          </SelectItem>
                          <SelectItem value="focused">{t('partnership.form.options.commitment.focused')}</SelectItem>
                          <SelectItem value="evaluation">
                            {t('partnership.form.options.commitment.evaluation')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('partnership.form.fields.customRequirements')}</label>
                    <Textarea
                      value={formData.customRequirements}
                      onChange={(e) => handleInputChange("customRequirements", e.target.value)}
                      placeholder={t('partnership.form.placeholders.customRequirements')}
                      rows={4}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal hover:from-fabriiq-teal hover:to-fabriiq-primary text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-fabriiq-primary/25 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{t('partnership.form.submit')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  {t('partnership.form.disclaimer')}
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-fabriiq-primary rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('partnership.form.success.title')}</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {t('partnership.form.success.message')}
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {t('partnership.form.success.another')}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('partnership_extended.beyondAlpha.title')}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                {t('partnership_extended.beyondAlpha.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              {t('partnership_extended.beyondAlpha.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DollarSign,
                title: t('partnership_extended.beyondAlpha.benefits.preferential_terms.title'),
                description: t('partnership_extended.beyondAlpha.benefits.preferential_terms.description'),
                color: "text-fabriiq-primary",
                bgColor: "from-fabriiq-primary/20 to-fabriiq-teal/10",
              },
              {
                icon: Lightbulb,
                title: t('partnership_extended.beyondAlpha.benefits.innovation_leadership.title'),
                description: t('partnership_extended.beyondAlpha.benefits.innovation_leadership.description'),
                color: "text-fabriiq-teal",
                bgColor: "from-fabriiq-teal/20 to-fabriiq-primary/10",
              },
              {
                icon: Building2,
                title: t('partnership_extended.beyondAlpha.benefits.legacy_advantage.title'),
                description: t('partnership_extended.beyondAlpha.benefits.legacy_advantage.description'),
                color: "text-primary",
                bgColor: "from-primary/20 to-fabriiq-primary/10",
              },
              {
                icon: Award,
                title: t('partnership_extended.beyondAlpha.benefits.thought_leadership.title'),
                description: t('partnership_extended.beyondAlpha.benefits.thought_leadership.description'),
                color: "text-emerald-400",
                bgColor: "from-emerald-500/20 to-teal-600/10",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${benefit.bgColor} backdrop-blur-xl border border-white/10 rounded-2xl p-6`}
              >
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  )
}
