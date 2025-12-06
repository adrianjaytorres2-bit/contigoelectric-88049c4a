import { motion } from "framer-motion";
import { Mail, Briefcase, Zap, Users, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const benefits = [
  {
    icon: Briefcase,
    title: "Competitive Pay",
    description: "Industry-leading wages with performance bonuses",
  },
  {
    icon: Shield,
    title: "Benefits Package",
    description: "Health insurance, paid time off, and retirement plans",
  },
  {
    icon: Users,
    title: "Team Environment",
    description: "Work alongside skilled professionals in a supportive culture",
  },
  {
    icon: Zap,
    title: "Growth Opportunities",
    description: "Training programs and career advancement paths",
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Contigo Electric Inc." className="h-10 w-auto" />
          </Link>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-foreground mb-4">
              JOIN OUR TEAM
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Build your career with Central Florida's trusted commercial electrical contractor. 
              We're always looking for talented electricians to join the Contigo Electric family.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl text-foreground text-center mb-12"
          >
            WHY WORK WITH US
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card border-border hover:border-primary/30 transition-colors text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              READY TO APPLY?
            </h2>
            <p className="text-muted-foreground mb-8">
              We're looking for experienced electricians, apprentices, and project managers 
              to join our growing team. Send your resume and a brief introduction to our 
              employment team.
            </p>
            
            <a
              href="mailto:employment@contigoelectric.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
            >
              <Mail className="w-5 h-5" />
              employment@contigoelectric.com
            </a>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Please include your work experience, certifications, and availability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Contigo Electric Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}