"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Target, Lightbulb, Shield, Globe, Brain, Building2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { CodeRain } from "@/components/code-rain"
import { SpinningEarth } from "@/components/spinning-earth"
import { useLanguage } from "@/contexts/language-context"

export default function AboutPage() {
  const { t } = useLanguage()
  return (
    <main className="relative min-h-screen bg-black text-foreground overflow-x-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        {/* Spinning Earth */}
        <div className="opacity-10">
          <SpinningEarth />
        </div>
        {/* Code rain */}
        <div className="opacity-10 dark:opacity-10 light:opacity-3">
          <CodeRain />
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10">
        <NavBar />

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-fabriiq-primary/10 border border-fabriiq-primary/20 text-fabriiq-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-fabriiq-primary rounded-full mr-2 animate-pulse"></span>
                {t("pages.about.hero.badge")}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                <span className="text-foreground">{t("pages.about.hero.title").split(" ")[0]} </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  {t("pages.about.hero.title").split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto leading-relaxed">
                {t("pages.about.hero.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-fabriiq-primary/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Target className="h-8 w-8 text-fabriiq-primary mr-3" />
                      <h2 className="text-2xl font-bold text-foreground">{t("pages.about.mission.title")}</h2>
                    </div>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t("pages.about.mission.description")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-fabriiq-teal/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      <Lightbulb className="h-8 w-8 text-fabriiq-teal mr-3" />
                      <h2 className="text-2xl font-bold text-foreground">{t("pages.about.vision.title")}</h2>
                    </div>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t("pages.about.vision.description")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-foreground">{t("pages.about.origin_story.title").split(" ").slice(0, 1).join(" ")} </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  {t("pages.about.origin_story.title").split(" ").slice(1).join(" ")}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">{t("pages.about.origin_story.subtitle")}</p>
            </motion.div>

            <div className="space-y-12">
              {/* Problem Discovery */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-6 border border-red-500/30">
                    <span className="text-red-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t("pages.about.origin_story.problem.title")}</h3>
                    <p className="text-muted-foreground mb-4 text-pretty leading-relaxed">
                      {t("pages.about.origin_story.problem.description_1")}
                    </p>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t("pages.about.origin_story.problem.description_2")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* The Revelation */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-6 border border-yellow-500/30">
                    <span className="text-yellow-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t("pages.about.origin_story.revelation.title")}</h3>
                    <p className="text-muted-foreground mb-4 text-pretty leading-relaxed">
                      {t("pages.about.origin_story.revelation.description_1")}
                    </p>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t("pages.about.origin_story.revelation.description_2")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Our Solution */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-fabriiq-primary/20 rounded-full flex items-center justify-center mr-6 border border-fabriiq-primary/30">
                    <span className="text-fabriiq-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t("pages.about.origin_story.solution.title")}</h3>
                    <p className="text-muted-foreground mb-4 text-pretty leading-relaxed">
                      {t("pages.about.origin_story.solution.description")}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-fabriiq-primary/10 p-4 rounded-lg border border-fabriiq-primary/20">
                        <h4 className="font-semibold text-fabriiq-primary mb-2">{t("pages.about.origin_story.solution.features.not_lms.title")}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("pages.about.origin_story.solution.features.not_lms.description")}
                        </p>
                      </div>
                      <div className="bg-fabriiq-teal/10 p-4 rounded-lg border border-fabriiq-teal/20">
                        <h4 className="font-semibold text-fabriiq-teal mb-2">{t("pages.about.origin_story.solution.features.ai_native.title")}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t("pages.about.origin_story.solution.features.ai_native.description")}
                        </p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2">{t("pages.about.origin_story.solution.features.multi_campus.title")}</h4>
                        <p className="text-sm text-muted-foreground">{t("pages.about.origin_story.solution.features.multi_campus.description")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Development Philosophy */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  {t('pages.about.development_philosophy.title')}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">{t('pages.about.development_philosophy.subtitle')}</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-fabriiq-primary/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-fabriiq-primary mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t('pages.about.development_philosophy.alpha_development.title')}</h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t('pages.about.development_philosophy.alpha_development.description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-fabriiq-teal/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <Shield className="h-8 w-8 text-fabriiq-teal mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-3">{t('pages.about.development_philosophy.transparency.title')}</h3>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                      {t('pages.about.development_philosophy.transparency.description')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Alpha Journey */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-fabriiq-primary/10 border border-fabriiq-primary/20 text-fabriiq-primary text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-fabriiq-primary rounded-full mr-2 animate-pulse"></span>
                {t('pages.about.alpha_journey.badge')}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-foreground">{t('pages.about.alpha_journey.title').split(' ').slice(0, -1).join(' ')} </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  {t('pages.about.alpha_journey.title').split(' ').slice(-1)[0]}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">{t('pages.about.alpha_journey.subtitle')}</p>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                className="flex items-center p-4 bg-fabriiq-primary/10 rounded-lg border border-fabriiq-primary/20"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-3 h-3 bg-fabriiq-primary rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-fabriiq-primary">{t('pages.about.alpha_journey.milestones.core_systems.title')}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('pages.about.alpha_journey.milestones.core_systems.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center p-4 bg-fabriiq-teal/10 rounded-lg border border-fabriiq-teal/20"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-3 h-3 bg-fabriiq-teal rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-fabriiq-teal">{t('pages.about.alpha_journey.milestones.ai_features.title')}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('pages.about.alpha_journey.milestones.ai_features.description')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center p-4 bg-primary/10 rounded-lg border border-primary/20"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-3 h-3 bg-primary rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-primary">{t('pages.about.alpha_journey.milestones.multi_campus.title')}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('pages.about.alpha_journey.milestones.multi_campus.description')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why School Operating System */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-fabriiq-primary/20 to-fabriiq-teal/20 backdrop-blur-sm border-y border-border/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-foreground">{t('pages.about.school_os.title').split('"')[0]}</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  &quot;{t('pages.about.school_os.title').split('"')[1]}&quot;?
                </span>
              </h2>
              <p className="text-xl mb-8 text-muted-foreground text-pretty leading-relaxed">
                {t('pages.about.school_os.description')}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Globe,
                  title: t('pages.about.school_os.features.unified_data.title'),
                  desc: t('pages.about.school_os.features.unified_data.description'),
                  color: "text-fabriiq-primary",
                },
                {
                  icon: Brain,
                  title: t('pages.about.school_os.features.intelligent_automation.title'),
                  desc: t('pages.about.school_os.features.intelligent_automation.description'),
                  color: "text-fabriiq-teal",
                },
                {
                  icon: Building2,
                  title: t('pages.about.school_os.features.extensible_architecture.title'),
                  desc: t('pages.about.school_os.features.extensible_architecture.description'),
                  color: "text-primary",
                },
                {
                  icon: Shield,
                  title: t('pages.about.school_os.features.resource_optimization.title'),
                  desc: t('pages.about.school_os.features.resource_optimization.description'),
                  color: "text-fabriiq-primary",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
                  <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Invitation */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal">
                  {t('pages.about.partnership_invitation.title')}
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
                {t('pages.about.partnership_invitation.description')}
              </p>
            </motion.div>

            <motion.div
              className="bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('pages.about.partnership_invitation.limited_positions.title')}</h3>
              <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
                {t('pages.about.partnership_invitation.limited_positions.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-fabriiq-primary to-fabriiq-teal hover:from-fabriiq-teal hover:to-fabriiq-primary text-white"
                >
                  <Link href="/partnership">
                    {t('pages.about.partnership_invitation.cta.explore')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border/50 hover:border-primary/50 bg-transparent"
                >
                  <Link href="/contact">{t('pages.about.partnership_invitation.cta.contact')}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {t('pages.about.partnership_invitation.footer_text')}
            </motion.p>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
