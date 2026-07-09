import { LocateFixed, Sparkles, TicketCheck } from "lucide-react";

const STEPS = [
  {
    icon: LocateFixed,
    title: "Разрешите геолокацию",
    description:
      "Откройте карту — приложение мгновенно покажет всё интересное в радиусе прогулки от вас.",
  },
  {
    icon: Sparkles,
    title: "Смотрите город в реальном времени",
    description:
      "Концерт начался, гид освободился, выставка открылась час назад — карта живёт вместе с городом.",
  },
  {
    icon: TicketCheck,
    title: "Бронируйте в один клик",
    description: "Билет на событие или экскурсию с гидом — без звонков и переписок в мессенджерах.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
            Как это работает
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Три шага до идеальной прогулки
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              style={{ animationDelay: `${i * 100}ms` }}
              className="animate-fade-up relative rounded-3xl border border-border bg-card p-8"
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <span className="absolute right-8 top-8 font-display text-4xl font-bold text-muted-foreground/20">
                0{i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
