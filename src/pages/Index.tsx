import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { ProjectsMap } from "@/components/ProjectsMap";
import { Reviews } from "@/components/Reviews";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <Hero />
      <Services />
      <About />
      <ProjectsMap />
      <Reviews />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
