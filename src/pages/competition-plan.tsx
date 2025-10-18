import { type FC, useMemo } from "react";

type CityPlan = {
  city: string;
  intro: string;
  items: string[];
  contacts?: Array<{ label?: string; name?: string; phones: string[] }>;
};

const publishedAt = "25 июля 2013 года";
const updatedAt = "29 марта 2016 года";

const data: CityPlan[] = [
  {
    city: "Астана",
    intro:
      "Утвержденный план соревнований на 2016 года. Казахстанская Лига Любителей Футбола.",
    items: [
      'Чемпионат ЛЛФ "Весна 2016" город Астана, апрель—июнь.',
      "Первенство ЛЛФ Республики Казахстан (финальная часть) город Астана, июль.",
      'Чемпионат ЛЛФ "Осень 2016" город Астана, август—октябрь.',
      'Чемпионат Европы 2016 "EMF" (Германия, Черногория) сентябрь.',
      'Первенство СФЛ "Золотая Осень 2016" город Астана, октябрь.',
      'Кубок ЛЛФ "Зима 2016" город Астана, ноябрь—март.',
      'Чемпионат ЛЛФ "Зима 2016" город Астана, ноябрь—март.',
    ],
    contacts: [
      {
        label: "Контактные телефоны О.К. ЛЛФ",
        phones: [
          "8 (7172) 677-590",
          "8 (7172) 677-529",
          "8 (705) 211-10-56",
          "8 (702) 121-37-39",
        ],
      },
    ],
  },
  {
    city: "Семей",
    intro:
      "Утвержденный план соревнование на 2016 года. Казахстанская Лига Любителей Футбола. город Семей.",
    items: [
      'Чемпионат ЛЛФ "Весна 2016" город Семей, апрель—июнь.',
      'Чемпионат ЛЛФ "Лето 2016" город Семей, июнь—август.',
      'Чемпионат ЛЛФ "Осень 2016" город Семей, август—октябрь.',
      'Кубок ЛЛФ "Золотая осень" город Семей, август—октябрь.',
      'Кубок ЛЛФ "Зима 2016" город Семей, ноябрь—март.',
      'Чемпионат ЛЛФ "Зима 2016" город Семей, ноябрь—март.',
    ],
    contacts: [
      {
        label: "Контактные телефоны представителей города Семей",
        name: "Кудабаев Арман Муратович",
        phones: ["8 (701) 555-79-68"],
      },
    ],
  },
  {
    city: "Алматы",
    intro:
      "Утвержденный план соревнование на 2016 года. Казахстанская Лига Любителей Футбола. город Алматы.",
    items: [
      "Чемпионат КЛЛФ «Весна 2016» г. Алматы, апрель—май.",
      "Финальная часть КЛЛФ г. Астана, июль.",
      "Чемпионат КЛЛФ «Осень 2016» г. Алматы, сентябрь—октябрь.",
    ],
    contacts: [
      {
        label: "Контактные телефоны представителей в г. Алматы",
        phones: ["8 (707) 522-30-07"],
        name: "Юсупов Рамиль",
      },
      {
        phones: ["8 (707) 235-59-96", "8 (777) 235-59-96"],
        name: "Хиль Сергей",
      },
    ],
  },
];

// утилита: приводим локальные номера в формат tel:+7...
const toTelHref = (raw: string) => {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "#";
  const normalized = digits.startsWith("8")
    ? `+7${digits.slice(1)}`
    : `+${digits}`;
  return `tel:${normalized}`;
};

const CompetitionPlanPage: FC = () => {
  // простые инлайн-стили без привязки к UI-библиотекам (унаследуют тему проекта)
  const styles = useMemo(
    () => ({
      page: { padding: 16, lineHeight: 1.6 } as const,
      header: { marginBottom: 8 } as const,
      meta: { fontSize: 14, opacity: 0.8, marginBottom: 16 } as const,
      section: { marginTop: 24 } as const,
      cityTitle: { margin: "0 0 8px 0", fontSize: 18 } as const,
      intro: { margin: "0 0 8px 0" } as const,
      list: { paddingLeft: 18, margin: "8px 0" } as const,
      contactsBlock: { marginTop: 8 } as const,
      contactRow: { margin: "2px 0" } as const,
      back: { display: "inline-block", marginTop: 24 } as const,
    }),
    [],
  );

  return (
    <main style={styles.page}>
      <h1 style={styles.header}>План соревнований</h1>

      <div style={styles.meta}>
        <div>Опубликовано: {publishedAt}</div>
        <div>Обновлено: {updatedAt}</div>
      </div>

      {data.map((block) => (
        <section key={block.city} style={styles.section}>
          <h2 style={styles.cityTitle}>
            {block.intro} {block.city ? `Город ${block.city}.` : ""}
          </h2>

          <ul style={styles.list}>
            {block.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>

          {block.contacts?.length ? (
            <div style={styles.contactsBlock}>
              {block.contacts.map((c, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  {c.label && <strong>{c.label}:</strong>}
                  {c.label && <br />}
                  {c.phones.map((p, j) => (
                    <div key={j} style={styles.contactRow}>
                      <a href={toTelHref(p)}>{p}</a>
                      {j === c.phones.length - 1 && c.name
                        ? ` — ${c.name}`
                        : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </main>
  );
};

export default CompetitionPlanPage;
