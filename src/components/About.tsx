import { motion } from "framer-motion";
import { Shield, Heart, Award, Clock, CheckCircle } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "SAFETY FIRST",
    description: "Industry-leading safety practices to protect our team, clients, and job sites.",
  },
  {
    icon: Heart,
    title: "INTEGRITY & TRUST",
    description: "Clear communication, fair pricing, and work we stand behind with pride.",
  },
  {
    icon: Award,
    title: "QUALITY CRAFTSMANSHIP",
    description: "Precision, professionalism, and attention to detail in every project.",
  },
  {
    icon: Clock,
    title: "DEPENDABILITY",
    description: "Consistent execution, met deadlines, and results you can rely on.",
  },
];

const reasons = [
  "Proven commercial and industrial experience",
  "Transparent communication and professional project management",
  "Competitive, honest pricing",
  "Skilled technicians trained in electrical, low-voltage, and life safety systems",
  "Long-term reliability and partnership-focused service",
];

export function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Promise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4">OUR PROMISE</h2>
          <p className="text-muted-foreground mb-12">
            Every project is approached with precision and professionalism.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {["Quality Service", "Customer Satisfaction", "Dependable Execution"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Who We Are */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-5xl md:text-6xl text-foreground mb-6">WHO WE ARE</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Contigo Electric Inc. is a trusted commercial electrical contractor based in Orlando, Florida, 
              offering high-quality Electrical, Communications, Security, and Life Safety services.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Since day one, we've built a reputation for delivering dependable work, honest communication, 
              and long-standing client relationships.
            </p>
            <blockquote className="border-l-4 border-primary pl-6 py-2">
              <p className="text-xl italic text-foreground">"Your project is our project."</p>
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-display text-3xl text-foreground mb-8">OUR VALUES</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-card rounded-lg border border-border"
                >
                  <value.icon className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-display text-lg text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Why Clients Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="font-display text-3xl text-foreground mb-8 text-center lg:text-left">
            WHY CLIENTS CHOOSE US
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{reason}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
