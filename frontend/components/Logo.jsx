import Image from "next/image";
import logo from "@/assets/logo.svg";

export default function Logo({ width = 100, height = 100 }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={logo} alt="MyForce logo" width={width} height={height} />
      <span className="text-xl font-semibold">MyForce</span>
    </div>
  );
}
