export const dynamicParams = false;

export function generateStaticParams() {
  return [{ type: "project" }, { type: "research" }, { type: "leader" }];
}

export default function EntriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
