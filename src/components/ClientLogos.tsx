import { motion } from "framer-motion";

const brands = [
  "Gucci", "Versace", "Christian Louboutin", "Under Armour", 
  "Chick-fil-A", "Taco Bell", "7-Eleven", "Regions Bank",
  "Uniqlo", "Hot Topic", "Journeys", "Marc Jacobs",
  "Hublot", "Omega", "Texas Roadhouse", "Tropical Smoothie"
];

export const ClientLogos = () => {
  return (
    <section className="py-12 md:py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm uppercase tracking-widest text-muted-foreground"
        >
          Trusted by Leading Brands
        </motion.p>
      </div>
      
      {/* Infinite scroll container */}
      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling content */}
        <div className="flex animate-scroll">
          {/* First set */}
          <div className="flex shrink-0">
            {brands.map((brand, index) => (
              <div
                key={`first-${index}`}
                className="flex items-center justify-center px-6 md:px-10"
              >
                <span className="font-display text-xl md:text-2xl lg:text-3xl text-muted-foreground/60 hover:text-primary transition-colors duration-300 whitespace-nowrap">
                  {brand}
                </span>
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex shrink-0">
            {brands.map((brand, index) => (
              <div
                key={`second-${index}`}
                className="flex items-center justify-center px-6 md:px-10"
              >
                <span className="font-display text-xl md:text-2xl lg:text-3xl text-muted-foreground/60 hover:text-primary transition-colors duration-300 whitespace-nowrap">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
