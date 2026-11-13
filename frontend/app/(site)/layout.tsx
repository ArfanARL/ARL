import RevealOnScroll from "../../components/RevealOnScroll";
import SiteFooter from "../../components/SiteFooter";
import ScrollProgress from "../../components/ScrollProgress";
import SiteHeader from "../../components/SiteHeader";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <RevealOnScroll />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
