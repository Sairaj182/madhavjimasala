import type { Metadata } from "next";
import InstallPwa from "@/components/shared/InstallPwa";

export const metadata: Metadata = {
  title: "Install the Madhavji Masala App",
  description: "Install the Madhavji Masala app on your phone or computer.",
};

export default function InstallPage() {
  return <InstallPwa />;
}
