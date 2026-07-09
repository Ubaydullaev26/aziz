import Link from "next/link";
import { MapPinned } from "lucide-react";

const COLUMNS = [
  {
    title: "Продукт",
    links: [
      { href: "#how-it-works", label: "Как это работает" },
      { href: "#live", label: "Сейчас в городе" },
      { href: "#cities", label: "Города" },
    ],
  },
  {
    title: "Компания",
    links: [
      { href: "/sign-up", label: "Начать бесплатно" },
      { href: "/sign-in", label: "Войти" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPinned className="h-4.5 w-4.5" />
            </span>
            Aziz
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Живая карта города: достопримечательности, гиды, экскурсии и события — всё вокруг вас,
            прямо сейчас.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aziz. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
