import Image from "next/image";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={`text-center mb-8 sm:mb-12 md:mb-16 ${className}`}>
      <div className="flex justify-center mb-4 sm:mb-6">
        <Image
          src="/images/heart.png"
          alt="Golden Heart"
          width={40}
          height={40}
          className="object-contain sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px]"
        />
      </div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold-primary mb-4 sm:mb-6 md:mb-8 tracking-wide uppercase px-4">
        {title}
      </h2>
      <p className="text-base sm:text-lg md:text-xl max-w-[800px] mx-auto leading-relaxed text-gray-800 px-4">
        {subtitle}
      </p>
      <div className="mt-6 sm:mt-8 flex justify-center">
        <div className="w-16 sm:w-20 md:w-24 h-[2px] bg-gold-primary"></div>
      </div>
    </header>
  );
}
