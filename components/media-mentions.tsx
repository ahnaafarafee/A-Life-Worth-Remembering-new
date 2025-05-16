import Image from "next/image";

export default function MediaMentions() {
  return (
    <section className="w-full py-10 bg-white border-t border-b border-gold-primary/30 my-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-lg md:text-xl font-bold text-gold-primary mb-8 tracking-widest uppercase">
          Media Mentions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={`row1-${i}`} className="flex justify-center">
              <Image
                src={i % 2 === 0 ? "/images/logo.png" : "/images/gold-logo.png"}
                alt="Media Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`row2-${i}`} className="flex justify-center">
              <Image
                src={i % 2 === 1 ? "/images/logo.png" : "/images/gold-logo.png"}
                alt="Media Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
