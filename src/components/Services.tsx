import { motion } from "framer-motion";
import { Zap, Shield, Cable, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Zap,
    title: "Commercial Electrical",
    description: "Full-scale commercial electrical contracting for businesses, builders, and property managers. Expert installation, maintenance, troubleshooting, and system upgrades.",
    features: ["New Construction", "Tenant Build-Outs", "Panel Upgrades", "Power Distribution"],
  },
  {
    icon: Shield,
    title: "Life Safety Systems",
    description: "Design, installation, and maintenance of life safety systems. Fire alarms, emergency lighting, and compliance upgrades meeting NFPA requirements.",
    features: ["Fire Alarms", "Emergency Lighting", "Inspections", "Compliance Upgrades"],
  },
  {
    icon: Cable,
    title: "Communications & Low Voltage",
    description: "Complete low-voltage and communications solutions. Structured cabling, fiber optics, data networks, access control, and CCTV systems.",
    features: ["Structured Cabling", "Fiber Optics", "Access Control", "CCTV Systems"],
  },
];

export function Services() {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground mb-3 md:mb-4">OUR SERVICES</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Comprehensive electrical solutions for commercial and industrial facilities across the state of Florida.
            <span className="block mt-2 text-xs md:text-sm">We also welcome residential projects—no job is too small.</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors group">
                <CardContent className="p-5 md:p-8">
                  <service.icon className="w-10 h-10 md:w-12 md:h-12 text-primary mb-4 md:mb-6" />
                  <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 md:mb-4">{service.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6 md:mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToContact}
                    className="flex items-center gap-2 text-primary hover:gap-3 transition-all group"
                  >
                    <span className="text-xs md:text-sm tracking-wider font-medium">LEARN MORE</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
