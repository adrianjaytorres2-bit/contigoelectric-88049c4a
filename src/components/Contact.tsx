import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
const contactInfo = [{
  icon: MapPin,
  label: "Location",
  value: "Orlando, Florida"
}, {
  icon: Phone,
  label: "Phone",
  phones: [
    { number: "(407) 272-9146", href: "tel:4072729146" },
    { number: "(407) 738-7839", href: "tel:4077387839" }
  ]
}, {
  icon: Mail,
  label: "Email",
  value: "info@contigoelectric.com",
  href: "mailto:info@contigoelectric.com"
}];
const services = ["Commercial Electrical", "Residential Electrical", "Life Safety Systems", "Communications & Low Voltage", "Multiple Services"];
export function Contact() {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "647fceb3-c9c4-40a1-8493-789390939dac",
          subject: "New Proposal Request - Contigo Electric Website",
          from_name: "Contigo Electric Website",
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "Not provided",
          company: formData.company || "Not provided",
          service: formData.service,
          message: formData.message || "No additional details provided",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Submitted",
          description: "Thank you! We'll get back to you within 24 hours.",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          service: "",
          message: "",
        });
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="contact" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }} className="text-center mb-10 md:mb-16">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground mb-3 md:mb-4">LET'S BUILD TOGETHER</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            Looking for a bid or consultation? We're ready to help bring your project to life.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Info */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="flex flex-row lg:flex-col gap-4 md:gap-6 flex-wrap justify-center lg:justify-start">
            {contactInfo.map(info => <div key={info.label} className="flex items-center lg:items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <info.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">{info.label}</div>
                  {'phones' in info ? (
                    <div className="text-sm md:text-base text-foreground">
                      <a href={info.phones[0].href} className="hover:text-primary transition-colors">{info.phones[0].number}</a>
                      <span className="text-muted-foreground"> or </span>
                      <a href={info.phones[1].href} className="hover:text-primary transition-colors">{info.phones[1].number}</a>
                    </div>
                  ) : info.href ? (
                    <a href={info.href} className="text-sm md:text-base text-foreground hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <div className="text-sm md:text-base text-foreground">{info.value}</div>
                  )}
                </div>
              </div>)}

            <div className="hidden lg:block pt-8">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                License: EC13007893 • Certified Electrical Contractor
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Serving Central Florida since 2018
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardContent className="p-5 md:p-8">
                <h3 className="font-display text-xl md:text-2xl text-foreground mb-4 md:mb-6">Request a Proposal</h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Name *</label>
                      <Input required value={formData.name} onChange={e => setFormData({
                      ...formData,
                      name: e.target.value
                    })} className="bg-secondary border-border text-sm md:text-base" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Email *</label>
                      <Input required type="email" value={formData.email} onChange={e => setFormData({
                      ...formData,
                      email: e.target.value
                    })} className="bg-secondary border-border text-sm md:text-base" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Phone</label>
                      <Input type="tel" value={formData.phone} onChange={e => setFormData({
                      ...formData,
                      phone: e.target.value
                    })} className="bg-secondary border-border text-sm md:text-base" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Company</label>
                      <Input value={formData.company} onChange={e => setFormData({
                      ...formData,
                      company: e.target.value
                    })} className="bg-secondary border-border text-sm md:text-base" placeholder="Company name" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Service Needed *</label>
                    <Select value={formData.service} onValueChange={value => setFormData({
                    ...formData,
                    service: value
                  })}>
                      <SelectTrigger className="bg-secondary border-border text-sm md:text-base">
                        <SelectValue placeholder="Select Service Needed" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {services.map(service => <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2 block">Project Details</label>
                    <Textarea value={formData.message} onChange={e => setFormData({
                    ...formData,
                    message: e.target.value
                  })} className="bg-secondary border-border min-h-[100px] md:min-h-[120px] text-sm md:text-base" placeholder="Tell us about your project..." />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base md:text-lg tracking-wider py-2.5 md:py-3">
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>;
}