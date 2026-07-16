import Image from 'next/image';
import { TRUST_LOGOS } from '@/content/testimonials';

// Trust row rendered from static SVG wordmark assets via next/image.
// Explicit width/height reserve layout space so the row contributes no CLS.
export default function TrustLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {TRUST_LOGOS.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={logo.name}
          width={200}
          height={40}
          className="h-8 w-auto opacity-70 transition-opacity hover:opacity-100"
        />
      ))}
    </div>
  );
}
