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
    <>
      <header>
        <Navbar />
      </header>
      <main className="min-h-screen bg-background dark">
        <Hero />
        <Services />
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
