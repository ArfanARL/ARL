import RevealOnScroll from "../../components/RevealOnScroll";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <RevealOnScroll />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
