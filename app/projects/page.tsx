"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronRight, Star, TrendingUp, Users, Zap, Shield, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import VideoPlayer from "@/components/video-player"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"

export default function CapabilitiesPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedCapability, setSelectedCapability] = useState<any>(null)
  const isMobile = useMobile()

  // Create dynamic capabilities using translation keys
  const createCapability = (id: string, videoUrl?: string, videoUrls?: string[], category?: string) => {
    const capability = t(`pages.projects.capabilities.${id}`, {}, { returnObjects: true })
    if (typeof capability === 'object' && capability !== null) {
      return {
        id,
        name: capability.name || id,
        subtitle: capability.subtitle || '',
        category: category || "System Admin Portal",
        status: t('pages.projects.status.alpha'),
        description: capability.description || '',
        videoUrl,
        videoUrls,
        features: capability.features || [],
        benefits: capability.benefits || [],
        tags: capability.tags || [],
        performance: capability.performance || {},
      }
    }
    // Fallback for missing translations
    return {
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      subtitle: '',
      category: category || "System Admin Portal",
      status: t('pages.projects.status.alpha'),
      description: '',
      videoUrl,
      videoUrls,
      features: [],
      benefits: [],
      tags: [],
      performance: {},
    }
  }

  const capabilities = [
    // System Admin Portal
    createCapability("system-admin-dashboard", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/System%20Admin%20Dashboard.mp4", undefined, "System Admin Portal"),
    createCapability("academic-calendar", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Academic%20Calendar.mp4", undefined, "System Admin Portal"),
    createCapability("enrollment-management", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Enrollments.mp4", undefined, "System Admin Portal"),
    createCapability("fee-management", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Fee%20Management.mp4", undefined, "System Admin Portal"),
    createCapability("question-bank", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Question%20Bank.mp4", undefined, "System Admin Portal"),
    createCapability("communication-hub", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/System%20Admin%20Communication%20hub.mp4", undefined, "System Admin Portal"),
    createCapability("curriculum-management", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/System%20Admin%20Subjects%20and%20learning%20outcomes.mp4", undefined, "System Admin Portal"),
    createCapability("system-compliance", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/System-Compliance.mp4", undefined, "System Admin Portal"),
    
    // Teacher Portal
    createCapability("class-analytics", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Class%20Reports.mp4", undefined, "Teacher Portal"),
    createCapability("resource-management", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Class%20Resources.mp4", undefined, "Teacher Portal"),
    createCapability("quiz-activities", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Quiz%20Activities.mp4", undefined, "Teacher Portal"),
    createCapability("assessment-creation", undefined, ["https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/TEacher%20-%20Create%20Assessment.mp4", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20assements%20view%20and%20grading.mp4"], "Teacher Portal"),
    createCapability("reading-activities", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20-%20Creating%20Reading%20with%20AI.mp4", undefined, "Teacher Portal"),
    createCapability("reward-system", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20-%20Rewards.mp4", undefined, "Teacher Portal"),
    createCapability("student-profiles", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Student%20class%20profile.mp4", undefined, "Teacher Portal"),
    createCapability("aivy-assistant", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20assements%20view%20and%20grading.mp4", undefined, "Teacher Portal"),
    createCapability("calendar-management", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20Calendar.mp4", undefined, "Teacher Portal"),
    createCapability("teacher-communication", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20Messeging.mp4", undefined, "Teacher Portal"),
    createCapability("social-wall", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher%20Social%20Wall.mp4", undefined, "Teacher Portal"),
    createCapability("attendance-tracking", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Teacher-%20Student%20Attendance.mp4", undefined, "Teacher Portal"),
    
    // Student Portal
    createCapability("learning-activities", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Student%20Activties.mp4", undefined, "Student Portal"),
    createCapability("personal-profile", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Student%20class%20profile.mp4", undefined, "Student Portal"),
    createCapability("aivy-companion", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Companion.mp4", undefined, "Student Portal"),
    createCapability("student-social", "https://mpfpuxztvmbmcdajkojf.supabase.co/storage/v1/object/public/Website%20Contnet/Student%20Social%20wall.mp4", undefined, "Student Portal"),
  ]

  const filters = [
    { id: "all", label: t("pages.capabilities.filters.all"), count: capabilities.length },
    {
      id: "system-admin",
      label: t("pages.capabilities.filters.system_admin"),
      count: capabilities.filter((c) => c.category === "System Admin Portal").length,
    },
    {
      id: "teacher",
      label: t("pages.capabilities.filters.teacher"),
      count: capabilities.filter((c) => c.category === "Teacher Portal").length,
    },
    {
      id: "student",
      label: t("pages.capabilities.filters.student"),
      count: capabilities.filter((c) => c.category === "Student Portal").length,
    },
  ]

  const filteredCapabilities = capabilities.filter((capability) => {
    const matchesSearch =
      capability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capability.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capability.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "system-admin" && capability.category === "System Admin Portal") ||
      (selectedFilter === "teacher" && capability.category === "Teacher Portal") ||
      (selectedFilter === "student" && capability.category === "Student Portal")

    return matchesSearch && matchesFilter
  })

  // Auto-select first capability when page loads or filters change
  useEffect(() => {
    if (filteredCapabilities.length > 0 && !selectedCapability) {
      setSelectedCapability(filteredCapabilities[0])
    }
  }, [filteredCapabilities, selectedCapability])

  // Reset selection when filter changes and current selection is no longer in filtered list
  useEffect(() => {
    if (selectedCapability && !filteredCapabilities.find(cap => cap.id === selectedCapability.id)) {
      setSelectedCapability(filteredCapabilities.length > 0 ? filteredCapabilities[0] : null)
    }
  }, [filteredCapabilities, selectedCapability])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "System Admin Portal":
        return <Shield className="w-6 h-6 text-primary" />
      case "Teacher Portal":
        return <Users className="w-6 h-6 text-primary" />
      case "Student Portal":
        return <Brain className="w-6 h-6 text-primary" />
      default:
        return <Zap className="w-6 h-6 text-primary" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      {isMobile ? (
        /* Mobile Layout */
        <div className="flex-1 pt-16">
          <div className="p-4">
            {/* Header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold mb-3 text-white">{t("pages.capabilities.title")}</h1>
              <p className="text-sm text-gray-400">
                {t("pages.capabilities.description")}
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              className="relative mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t("pages.capabilities.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm transition-all duration-200"
              />
            </motion.div>

            {/* Filters */}
            <motion.div
              className="flex flex-wrap gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-1 text-xs rounded transition-all duration-200 hover:scale-105 ${
                    selectedFilter === filter.id
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "bg-gray-950 text-gray-400 border border-gray-800 hover:text-white hover:border-primary/30"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </motion.div>

            <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-6 pr-2">
              {filteredCapabilities.map((capability, index) => (
                <motion.div
                  key={capability.id}
                  className="bg-black border border-white/20 rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Capability Header */}
                  <div className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.div
                        className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20"
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getCategoryIcon(capability.category)}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{capability.name}</h3>
                        <p className="text-sm text-primary mb-1">{capability.subtitle}</p>
                        <p className="text-xs text-gray-400 mb-2">{capability.category}</p>
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {capability.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{capability.description}</p>

                    {/* Video Demo */}
                    {capability.videoUrl && (
                      <div className="mb-4">
                        <VideoPlayer src={capability.videoUrl} title={`${capability.name} Demo`} />
                      </div>
                    )}

                    {/* Multiple Videos */}
                    {capability.videoUrls && capability.videoUrls.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {capability.videoUrls.map((videoUrl, videoIndex) => (
                          <div key={videoIndex}>
                            <h5 className="text-sm font-medium text-gray-300 mb-2">
                              Demo {videoIndex + 1}: {videoIndex === 0 ? "Creation" : "Grading"}
                            </h5>
                            <VideoPlayer src={videoUrl} title={`${capability.name} Demo ${videoIndex + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Features and Benefits Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-primary" />
                          {t("pages.capabilities.key_features")}
                        </h4>
                        <ul className="space-y-1">
                          {capability.features.map((feature, idx) => (
                            <motion.li
                              key={idx}
                              className="text-xs text-gray-300 flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                              <ChevronRight className="w-3 h-3 mr-1 mt-0.5 text-primary flex-shrink-0" />
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                          {t("pages.capabilities.expected_benefits")}
                        </h4>
                        <ul className="space-y-1">
                          {capability.benefits.map((benefit, idx) => (
                            <motion.li
                              key={idx}
                              className="text-xs text-gray-300 flex items-start"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                              <Star className="w-3 h-3 mr-1 mt-0.5 text-green-400 flex-shrink-0" />
                              {benefit}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {capability.tags.map((tag) => (
                        <motion.span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-primary/20 hover:text-primary transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(capability.performance).map(([key, value]) => (
                        <motion.div
                          key={key}
                          className="text-center p-2 bg-gray-900/50 rounded-lg border border-gray-800"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-lg font-bold text-primary">{value}</p>
                          <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex flex-1 pt-16">
          {/* Left Sidebar - Capabilities List */}
          <div className="w-1/3 border-r border-gray-800 bg-black h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-2xl font-bold mb-3 text-white">{t("pages.capabilities.title")}</h1>
                <p className="text-sm text-gray-400">
                  {t("pages.capabilities.description")}
                </p>
              </motion.div>

              {/* Search */}
              <motion.div
                className="relative mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t("pages.capabilities.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400 text-sm transition-all duration-200"
                />
              </motion.div>

              {/* Filters */}
              <motion.div
                className="flex flex-wrap gap-2 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-3 py-1 text-xs rounded transition-all duration-200 hover:scale-105 ${
                      selectedFilter === filter.id
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "bg-gray-950 text-gray-400 border border-gray-800 hover:text-white hover:border-primary/30"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </motion.div>

              {/* Capabilities List */}
              <div className="space-y-3">
                {filteredCapabilities.map((capability, index) => (
                  <motion.div
                    key={capability.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      selectedCapability?.id === capability.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-gray-950 border-gray-800 hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedCapability(capability)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        {getCategoryIcon(capability.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{capability.name}</h3>
                        <p className="text-xs text-primary truncate">{capability.subtitle}</p>
                        <p className="text-xs text-gray-400">{capability.category}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Capability Details */}
          <div className="flex-1 bg-background">
            {selectedCapability ? (
              <motion.div
                className="p-6 h-[calc(100vh-64px)] overflow-y-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div
                      className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20"
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getCategoryIcon(selectedCapability.category)}
                    </motion.div>
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{selectedCapability.name}</h1>
                      <p className="text-lg text-primary mb-1">{selectedCapability.subtitle}</p>
                      <p className="text-sm text-gray-400 mb-2">{selectedCapability.category}</p>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {selectedCapability.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{selectedCapability.description}</p>
                </div>

                {/* Video Demo */}
                {selectedCapability.videoUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{t("pages.capabilities.interactive_demo")}</h3>
                    <VideoPlayer src={selectedCapability.videoUrl} title={`${selectedCapability.name} Demo`} />
                  </div>
                )}

                {/* Multiple Videos */}
                {selectedCapability.videoUrls && selectedCapability.videoUrls.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{t("pages.capabilities.interactive_demos")}</h3>
                    <div className="space-y-4">
                      {selectedCapability.videoUrls.map((videoUrl, videoIndex) => (
                        <div key={videoIndex}>
                          <h4 className="text-md font-medium text-gray-300 mb-2">
                            Demo {videoIndex + 1}: {videoIndex === 0 ? t("pages.capabilities.demo.creation") || "Creation Process" : t("pages.capabilities.demo.grading") || "Grading & Analytics"}
                          </h4>
                          <VideoPlayer src={videoUrl} title={`${selectedCapability.name} Demo ${videoIndex + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features and Benefits Side by Side */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-primary" />
                      {t("pages.capabilities.key_features")}
                    </h3>
                    <ul className="space-y-2">
                      {selectedCapability.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="text-sm text-gray-300 flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <ChevronRight className="w-4 h-4 mr-2 mt-0.5 text-primary flex-shrink-0" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                      {t("pages.capabilities.expected_benefits")}
                    </h3>
                    <ul className="space-y-2">
                      {selectedCapability.benefits.map((benefit, idx) => (
                        <motion.li
                          key={idx}
                          className="text-sm text-gray-300 flex items-start"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <Star className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Performance Metrics */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{t("pages.capabilities.alpha_performance")}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(selectedCapability.performance).map(([key, value]) => (
                      <motion.div
                        key={key}
                        className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-primary/30 transition-all duration-200"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-2xl font-bold text-primary mb-1">{t("pages.capabilities.expected_prefix")} {value}</p>
                        <p className="text-sm text-gray-400">{t(`pages.capabilities.performance_metrics.${key}`) || key.replace(/([A-Z])/g, " $1").trim()}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{t("pages.capabilities.tags")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCapability.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-primary/20 hover:text-primary transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{t("pages.capabilities.select_capability")}</h3>
                  <p className="text-gray-400">
                    {t("pages.capabilities.select_capability_desc")}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
