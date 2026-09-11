import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { AppShowcase } from "@/components/AppShowcase";
import { Testimonials } from "@/components/Testimonials";
import { DownloadCta } from "@/components/DownloadCta";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <AppShowcase />
      <Testimonials />
      <DownloadCta />
      <Footer />
    </>
  );
}
