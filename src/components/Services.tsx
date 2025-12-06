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
    <section id="services" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4">OUR SERVICES</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive electrical solutions for commercial and industrial facilities across Central Florida.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full bg-card border-border hover:border-primary/50 transition-colors group">
                <CardContent className="p-8">
                  <service.icon className="w-12 h-12 text-primary mb-6" />
                  <h3 className="font-display text-2xl text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToContact}
                    className="flex items-center gap-2 text-primary hover:gap-3 transition-all group"
                  >
                    <span className="text-sm tracking-wider font-medium">LEARN MORE</span>
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
