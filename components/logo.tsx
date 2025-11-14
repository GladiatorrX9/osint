import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
  variant?: "default" | "sidebar" | "header";
}

const sizeMap = {
  sm: { width: 24, height: 24, textSize: "text-sm" },
  md: { width: 32, height: 32, textSize: "text-base" },
  lg: { width: 40, height: 40, textSize: "text-lg" },
  xl: { width: 48, height: 48, textSize: "text-xl" },
};

export function Logo({
  size = "md",
  showText = true,
  href = "/dashboard",
  className = "",
  variant = "default",
}: LogoProps) {
  const { width, height, textSize } = sizeMap[size];

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-white dark:bg-white rounded-lg p-1.5 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="GladiatorrX Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-semibold ${textSize}`}>GladiatorrX</span>
          {variant === "sidebar" && (
            <span className="text-xs text-muted-foreground truncate">
              Breach Intelligence
            </span>
          )}
          {variant === "header" && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">
              Leak Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
