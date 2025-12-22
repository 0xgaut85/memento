import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/transparentlogo.png"
              alt="Memento"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-serif text-sm text-muted-foreground">
              memento.money
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="https://memento.money" target="_blank" className="hover:text-foreground transition-colors">
              Website
            </Link>
            <Link href="https://x.com/mementodotmoney" target="_blank" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <span>© 2024 Memento</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
