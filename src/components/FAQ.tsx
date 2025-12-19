import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What areas do you serve?",
    answer: "We serve all of Florida, including Orlando, Tampa, Jacksonville, Ft. Lauderdale, and surrounding areas. With 250+ completed projects across 400+ Florida cities, we have the reach and expertise to handle projects throughout the state."
  },
  {
    question: "Are you licensed and insured?",
    answer: "Yes, Contigo Electric is fully licensed (EC13007893) and insured. We maintain a BuildZoom score of 108, placing us in the top 5% of Florida licensed contractors. Our team adheres to all state and local regulations."
  },
  {
    question: "How long does a typical commercial project take?",
    answer: "Project timelines vary based on scope and complexity. Small retail buildouts may take 2-4 weeks, while larger commercial projects can span several months. We provide detailed timelines during the quote process and pride ourselves on meeting deadlines."
  },
  {
    question: "Do you handle permits and inspections?",
    answer: "Absolutely. We manage the entire permitting process from start to finish, including all required inspections. Our team is well-versed in local codes and regulations, ensuring your project passes inspection the first time."
  },
  {
    question: "Do you work on residential projects?",
    answer: "While commercial electrical work is our primary focus, we welcome residential projects as well. Whether it's a home renovation, new construction, or electrical upgrades, our team delivers the same quality and professionalism."
  },
  {
    question: "What types of commercial projects do you handle?",
    answer: "We specialize in retail stores, restaurants, convenience stores, banks, medical facilities, office buildouts, and more. Our portfolio includes work for major brands like Gucci, Versace, Chick-fil-A, 7-Eleven, and Regions Bank."
  },
  {
    question: "How do I get a quote?",
    answer: "Getting a quote is easy! Simply fill out our contact form, call us directly, or send us an email with your project details. We'll review your requirements and provide a comprehensive estimate, typically within 24-48 hours."
  },
  {
    question: "What sets Contigo Electric apart?",
    answer: "With 75+ years of combined experience, a top 5% BuildZoom rating, and over 250 successful projects, we bring unmatched expertise to every job. We prioritize communication, quality workmanship, and on-time delivery—that's why leading brands trust us."
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our services, process, and expertise.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-lg px-6 bg-card/30"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-medium text-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
