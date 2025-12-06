import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Statistics } from "@/components/Statistics";
import { Services } from "@/components/Services";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { About } from "@/components/About";
import { ProjectsMap } from "@/components/ProjectsMap";
import { Reviews } from "@/components/Reviews";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="min-h-screen bg-background dark">
        <Hero />
        <Statistics />
        <Services />
        <FeaturedProjects />
        <About />
        <ProjectsMap />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
};

export default Index;
