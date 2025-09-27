"use client"

import { motion } from "framer-motion"
import { Code, Terminal, Zap } from "lucide-react"

export function TechnicalCodeSection() {
  const codeString = `function educationalIntelligence() {
  const fabriiq = {
    // AIVY Multi-Agent System
    aivy: {
      agents: ['Student Companion', 'Teacher Assistant', 'Content Generator'],
      orchestration: 'Real-time collaboration',
      memory: 'Persistent cross-session context'
    },
    
    // Bloom's Taxonomy Integration  
    pedagogy: {
      framework: 'Six cognitive levels',
      classification: 'Automated content analysis',
      tracking: 'Real-time mastery measurement'
    },
    
    // Multi-Campus Architecture
    operations: {
      enrollment: 'Automated workflows',
      finance: 'Multi-currency support', 
      attendance: 'Predictive analytics',
      reporting: 'Real-time dashboards'
    },
    
    // Privacy by Design
    compliance: {
      ferpa: 'Native architecture',
      audit: 'Comprehensive logging',
      privacy: 'AI-powered protection'
    }
  };
  
  return fabriiq.transform(education);
}`

  return (
    <section className="py-20 px-4 sm:px-6 relative bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto">
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
            <Terminal className="w-4 h-4 text-fabriiq-primary" />
            <span className="text-sm font-medium text-fabriiq-primary">Technical Architecture</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Built for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
              Education
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Purpose-built architecture designed specifically for educational institutions, not generic solutions
            retrofitted for schools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Code Block */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Code className="w-4 h-4" />
                  <span>fabriiq-core.js</span>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300 leading-relaxed">
                  <code>
                    {codeString.split("\n").map((line, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="block"
                      >
                        {line.includes("//") ? (
                          <>
                            {line.split("//")[0]}
                            <span className="text-green-400">
                              {"//"}
                              {line.split("//")[1]}
                            </span>
                          </>
                        ) : line.includes("'") ? (
                          line.split("'").map((part, i) =>
                            i % 2 === 0 ? (
                              <span key={i} className="text-gray-300">
                                {part}
                              </span>
                            ) : (
                              <span key={i} className="text-yellow-400">
                                &apos;{part}&apos;
                              </span>
                            ),
                          )
                        ) : line.includes("function") || line.includes("const") || line.includes("return") ? (
                          <span className="text-blue-400">{line}</span>
                        ) : (
                          <span className="text-gray-300">{line}</span>
                        )}
                      </motion.div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-fabriiq-primary/5 via-transparent to-fabriiq-teal/5 pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Technical Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Technical Excellence</h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Every component of FabriiQ is designed with educational workflows in mind, from AIVY&apos;s multi-agent
                intelligence to FERPA-native privacy architecture.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: "AIVY Multi-Agent System",
                  description: "Purpose-built AI agents that understand educational contexts and workflows",
                  color: "text-fabriiq-primary",
                },
                {
                  icon: Terminal,
                  title: "Bloom's Taxonomy Native",
                  description: "Integrated cognitive level tracking and mastery measurement at the core",
                  color: "text-fabriiq-teal",
                },
                {
                  icon: Code,
                  title: "Privacy-by-Design",
                  description: "FERPA compliance built into the architecture, not bolted on afterwards",
                  color: "text-primary",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-6"
            >
              <div className="p-6 bg-gradient-to-r from-fabriiq-primary/10 to-fabriiq-teal/10 rounded-xl border border-fabriiq-primary/20">
                <h4 className="text-lg font-semibold text-white mb-2">Alpha Development Status</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Core systems are active and being refined through development partnerships. Join us in co-creating the
                  future of educational technology.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
