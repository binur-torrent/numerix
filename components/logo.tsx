import Image from "next/image";

export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={655}
      height={623}
      priority
      className={className}
    />
  );
}
