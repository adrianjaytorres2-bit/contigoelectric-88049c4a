import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Statistics } from "@/components/Statistics";
import { ClientLogos } from "@/components/ClientLogos";
import { Services } from "@/components/Services";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { About } from "@/components/About";
import { ProjectsMap } from "@/components/ProjectsMap";
import { Reviews } from "@/components/Reviews";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

const Index = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="min-h-screen bg-background dark">
        <Hero />
        <Statistics />
        <ClientLogos />
        <Services />
        <FeaturedProjects />
        <About />
        <ProjectsMap />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
};

export default Index;
