import { PrismaClient, PriceLevel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Deterministic, locally generated gradient placeholders (see
// /api/placeholder/[seed]) — no external image CDN dependency. Swap for
// real photography via the admin panel; the schema doesn't care where the
// URL points.
const img = (seed: string, w = 1200, h = 800) => `/api/placeholder/${seed}?w=${w}&h=${h}`;

const hoursFromNow = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);
const daysFromNowAt = (days: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

async function main() {
  console.log("Seeding database…");

  // ── Country / City ───────────────────────────────────────────────────
  const uzbekistan = await prisma.country.upsert({
    where: { code: "UZ" },
    update: {},
    create: {
      code: "UZ",
      nameRu: "Узбекистан",
      nameEn: "Uzbekistan",
      nameUz: "O'zbekiston",
    },
  });

  const samarkand = await prisma.city.upsert({
    where: { slug: "samarkand" },
    update: {},
    create: {
      slug: "samarkand",
      countryId: uzbekistan.id,
      nameRu: "Самарканд",
      nameEn: "Samarkand",
      nameUz: "Samarqand",
      descriptionRu:
        "Один из древнейших городов мира и жемчужина Великого шёлкового пути. Бирюзовые купола, средневековые медресе и оживлённые базары делают Самарканд живым музеем под открытым небом.",
      descriptionEn:
        "One of the world's oldest cities and a jewel of the Great Silk Road. Turquoise domes, medieval madrasas and bustling bazaars make Samarkand a living open-air museum.",
      descriptionUz:
        "Dunyodagi eng qadimiy shaharlardan biri va Buyuk Ipak yo'lining marvaridi. Farfor gumbazlar, o'rta asr madrasalari va gavjum bozorlar Samarqandni ochiq osmon ostidagi jonli muzeyga aylantiradi.",
      coverImage: img("samarkand-city"),
      latitude: 39.6542,
      longitude: 66.9597,
      defaultZoom: 14.2,
      timezone: "Asia/Samarkand",
    },
  });

  // ── Categories ────────────────────────────────────────────────────────
  const categoryDefs = [
    { key: "historical", nameRu: "Исторические места", nameEn: "Historical Sites", nameUz: "Tarixiy joylar", icon: "Landmark", color: "#0EA5A4", isEventCategory: false, position: 1 },
    { key: "museum", nameRu: "Музеи", nameEn: "Museums", nameUz: "Muzeylar", icon: "Building2", color: "#6366F1", isEventCategory: false, position: 2 },
    { key: "restaurant", nameRu: "Рестораны", nameEn: "Restaurants", nameUz: "Restoranlar", icon: "UtensilsCrossed", color: "#F97316", isEventCategory: false, position: 3 },
    { key: "cafe", nameRu: "Кафе", nameEn: "Cafés", nameUz: "Kafelar", icon: "Coffee", color: "#B45309", isEventCategory: false, position: 4 },
    { key: "national_cuisine", nameRu: "Национальная кухня", nameEn: "Local Cuisine", nameUz: "Milliy taomlar", icon: "ChefHat", color: "#DC2626", isEventCategory: false, position: 5 },
    { key: "viewpoint", nameRu: "Смотровые площадки", nameEn: "Viewpoints", nameUz: "Ko'rgazma maydonchalari", icon: "Mountain", color: "#0284C7", isEventCategory: false, position: 6 },
    { key: "shopping", nameRu: "Покупки", nameEn: "Shopping", nameUz: "Xaridlar", icon: "ShoppingBag", color: "#A855F7", isEventCategory: false, position: 7 },
    { key: "nightlife", nameRu: "Ночная жизнь", nameEn: "Nightlife", nameUz: "Tungi hayot", icon: "Moon", color: "#4338CA", isEventCategory: false, position: 8 },
    { key: "concert", nameRu: "Концерты", nameEn: "Concerts", nameUz: "Konsertlar", icon: "Music", color: "#EC4899", isEventCategory: true, position: 9 },
    { key: "festival", nameRu: "Фестивали", nameEn: "Festivals", nameUz: "Festivallar", icon: "PartyPopper", color: "#F59E0B", isEventCategory: true, position: 10 },
    { key: "exhibition", nameRu: "Выставки", nameEn: "Exhibitions", nameUz: "Ko'rgazmalar", icon: "Image", color: "#14B8A6", isEventCategory: true, position: 11 },
    { key: "masterclass", nameRu: "Мастер-классы", nameEn: "Masterclasses", nameUz: "Master-klasslar", icon: "Palette", color: "#EF4444", isEventCategory: true, position: 12 },
  ];

  const categories: Record<string, Awaited<ReturnType<typeof prisma.category.upsert>>> = {};
  for (const c of categoryDefs) {
    categories[c.key] = await prisma.category.upsert({
      where: { key: c.key },
      update: c,
      create: c,
    });
  }

  // ── Users ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const demoPassword = await bcrypt.hash("Demo1234!", 10);
  const guidePassword = await bcrypt.hash("Guide1234!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aziz.app" },
    update: {},
    create: {
      email: "admin@aziz.app",
      name: "Aziz Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@aziz.app" },
    update: {},
    create: {
      email: "demo@aziz.app",
      name: "Тимур Искандаров",
      passwordHash: demoPassword,
      role: "USER",
      emailVerified: new Date(),
      image: img("demo-user", 200, 200),
    },
  });

  const guideUser = await prisma.user.upsert({
    where: { email: "guide@aziz.app" },
    update: {},
    create: {
      email: "guide@aziz.app",
      name: "Dilnoza Yusupova",
      passwordHash: guidePassword,
      role: "GUIDE",
      emailVerified: new Date(),
      image: img("dilnoza", 400, 400),
    },
  });

  console.log("Test accounts:");
  console.log("  admin@aziz.app / Admin123!");
  console.log("  demo@aziz.app  / Demo1234!");
  console.log("  guide@aziz.app / Guide1234!");

  // ── Places ────────────────────────────────────────────────────────────
  const placeDefs: Array<{
    slug: string;
    categoryKey: string;
    nameRu: string;
    nameEn: string;
    nameUz: string;
    shortDescriptionRu: string;
    descriptionRu: string;
    descriptionEn: string;
    descriptionUz: string;
    historyRu?: string;
    historyEn?: string;
    historyUz?: string;
    address: string;
    latitude: number;
    longitude: number;
    priceLevel: PriceLevel;
    priceFrom: number | null;
    isFeatured: boolean;
    hours: { dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed?: boolean }[];
  }> = [
    {
      slug: "registan",
      categoryKey: "historical",
      nameRu: "Регистан",
      nameEn: "Registan",
      nameUz: "Registon",
      shortDescriptionRu: "Главная площадь Самарканда с тремя грандиозными медресе",
      descriptionRu:
        "Регистан — сердце древнего Самарканда, ансамбль из трёх медресе XV–XVII веков: Улугбека, Шердор и Тилля-Кари. Бирюзовая мозаика, гигантские порталы-пештаки и внутренние дворы делают площадь одним из самых узнаваемых архитектурных ансамблей Центральной Азии.",
      descriptionEn:
        "Registan is the heart of ancient Samarkand — an ensemble of three 15th–17th century madrasas: Ulugbek, Sher-Dor and Tilya-Kori. Turquoise mosaics, monumental portals and inner courtyards make it one of Central Asia's most recognizable architectural ensembles.",
      descriptionUz:
        "Registon — qadimiy Samarqandning yuragi, XV–XVII asrlarga oid uchta madrasa: Ulug'bek, Sherdor va Tillakori majmuasi. Farfor rangli mozaikalar va ulkan peshtoqlar uni Markaziy Osiyoning eng tanish me'moriy ansambllaridan biriga aylantiradi.",
      historyRu:
        "Строительство начал в 1417–1420 годах внук Тамерлана, учёный-правитель Улугбек, возведя медресе с обсерваторским уклоном обучения. Спустя два столетия, в 1619–1636 годах, напротив было построено медресе Шердор («Обитель львов»), а в 1646–1660 — Тилля-Кари («Позолоченное»), мечеть-медресе с ослепительным золочёным залом.",
      address: "площадь Регистан, Самарканд, Узбекистан",
      latitude: 39.6542,
      longitude: 66.9756,
      priceLevel: "LOW",
      priceFrom: 50000,
      isFeatured: true,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "08:00", closesAt: "20:00" })),
    },
    {
      slug: "shahi-zinda",
      categoryKey: "historical",
      nameRu: "Шахи-Зинда",
      nameEn: "Shah-i-Zinda",
      nameUz: "Shohizinda",
      shortDescriptionRu: "Некрополь голубых куполов и аллея мавзолеев XI–XIX веков",
      descriptionRu:
        "Шахи-Зинда — «живой царь», некрополь-улица, поднимающаяся по склону холма Афросиаб. Десятки мавзолеев XIV–XV веков, облицованных резной майоликой, образуют один из самых атмосферных ансамблей исламской архитектуры в мире.",
      descriptionEn:
        "Shah-i-Zinda, the 'Living King', is a street-necropolis climbing the slope of ancient Afrasiyab. Dozens of 14th–15th century mausoleums, clad in carved majolica, form one of the most atmospheric ensembles of Islamic architecture in the world.",
      descriptionUz:
        "Shohizinda — Afrosiyob tepaligi yon bag'ridan ko'tarilgan ko'cha-work necropolis. XIV–XV asrlarga oid o'nlab maqbaralar dunyodagi eng ta'sirchan islom me'morchiligi ansambllaridan birini tashkil qiladi.",
      historyRu:
        "По легенде, здесь похоронен Кусам ибн Аббас, двоюродный брат пророка Мухаммада, принёсший ислам в Согдиану. Комплекс формировался с XI по XIX век, но основной ансамбль мавзолеев тимуридской знати возведён в XIV–XV веках.",
      address: "улица Шахи-Зинда, Самарканд, Узбекистан",
      latitude: 39.6603,
      longitude: 66.9812,
      priceLevel: "LOW",
      priceFrom: 30000,
      isFeatured: true,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "07:00", closesAt: "19:00" })),
    },
    {
      slug: "bibi-khanym",
      categoryKey: "historical",
      nameRu: "Мечеть Биби-Ханым",
      nameEn: "Bibi-Khanym Mosque",
      nameUz: "Bibixonim masjidi",
      shortDescriptionRu: "Одна из крупнейших мечетей средневекового исламского мира",
      descriptionRu:
        "Соборная мечеть, задуманная Тамерланом как самая большая в мусульманском мире после его победоносного похода в Индию. Гигантский портал и голубой купол до сих пор поражают масштабом, несмотря на разрушения от землетрясений.",
      descriptionEn:
        "A congregational mosque conceived by Tamerlane to be the largest in the Muslim world after his victorious campaign in India. Its giant portal and blue dome still astonish with scale despite earthquake damage over the centuries.",
      descriptionUz:
        "Amir Temur tomonidan Hindiston yurishidan so'ng musulmon dunyosidagi eng katta masjid sifatida rejalashtirilgan jome masjidi. Ulkan peshtoq va moviy gumbaz hozirgача ham o'z ulug'vorligi bilan hayratga soladi.",
      historyRu: "Возведена в 1399–1404 годах, по легенде — в честь любимой жены Тамерлана.",
      address: "улица Бибиханым, Самарканд, Узбекистан",
      latitude: 39.6577,
      longitude: 66.9761,
      priceLevel: "LOW",
      priceFrom: 30000,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "08:00", closesAt: "19:00" })),
    },
    {
      slug: "gur-e-amir",
      categoryKey: "historical",
      nameRu: "Гур-Эмир",
      nameEn: "Gur-e-Amir",
      nameUz: "Go'ri Amir",
      shortDescriptionRu: "Мавзолей Тамерлана и династии Тимуридов",
      descriptionRu:
        "Гур-Эмир («Могила эмира») — усыпальница Тамерлана, его сыновей и внука, астронома Улугбека. Рифлёный бирюзовый купол на высоком барабане стал архитектурным прототипом для мавзолеев Великих Моголов, включая индийский Тадж-Махал.",
      descriptionEn:
        "Gur-e-Amir ('Tomb of the King') is the mausoleum of Tamerlane, his sons, and his grandson, the astronomer Ulugbek. Its ribbed turquoise dome became an architectural prototype for later Mughal mausoleums, including the Taj Mahal.",
      descriptionUz:
        "Go'ri Amir — Amir Temur, uning o'g'illari va nabirasi, mashhur astronom Ulug'bekning maqbarasi. Uning naqshinkor moviy gumbazi keyinchalik Buyuk Mo'g'ullar, jumladan Toj-Mahal maqbaralariga namuna bo'lgan.",
      historyRu: "Строительство завершено в 1404 году как усыпальница любимого внука Тимура, Мухаммад-Султана.",
      address: "улица Амира Темура, Самарканд, Узбекистан",
      latitude: 39.6486,
      longitude: 66.9747,
      priceLevel: "LOW",
      priceFrom: 40000,
      isFeatured: true,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "08:00", closesAt: "19:00" })),
    },
    {
      slug: "ulugbek-observatory",
      categoryKey: "museum",
      nameRu: "Обсерватория Улугбека",
      nameEn: "Ulugbek Observatory",
      nameUz: "Ulug'bek rasadxonasi",
      shortDescriptionRu: "Крупнейшая астрономическая обсерватория средневекового Востока",
      descriptionRu:
        "Построенная в 1420-х годах правителем-астрономом Улугбеком, обсерватория содержала гигантский секстант радиусом 40 метров для наблюдения за звёздами. Здесь был составлен звёздный каталог «Зидж-и Гурагони» с точностью, опередившей своё время на столетия.",
      descriptionEn:
        "Built in the 1420s by the astronomer-ruler Ulugbek, the observatory housed a giant 40-metre radius sextant for tracking stars. Here the 'Zij-i Sultani' star catalogue was compiled with a precision that was centuries ahead of its time.",
      descriptionUz:
        "1420-yillarda hukmdor-astronom Ulug'bek tomonidan qurilgan rasadxonada yulduzlarni kuzatish uchun radiusi 40 metrli ulkan sekstant bo'lgan. Bu yerda o'z davridan asrlar oldinda bo'lgan aniqlikdagi yulduzlar katalogi tuzilgan.",
      historyRu: "Обсерватория была разрушена вскоре после убийства Улугбека в 1449 году и заново открыта археологом В. Л. Вяткиным в 1908 году.",
      address: "улица Тошкент, Самарканд, Узбекистан",
      latitude: 39.6706,
      longitude: 66.9494,
      priceLevel: "LOW",
      priceFrom: 25000,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "09:00", closesAt: "18:00" })),
    },
    {
      slug: "karimbek-restaurant",
      categoryKey: "national_cuisine",
      nameRu: "Karimbek",
      nameEn: "Karimbek",
      nameUz: "Karimbek",
      shortDescriptionRu: "Легендарный плов и узбекская кухня в самом сердце города",
      descriptionRu:
        "Просторный ресторан с летней террасой, известный своим пловом «Самаркандский» на хлопковом масле и большим выбором шашлыков. Место, где местные жители отмечают семейные торжества.",
      descriptionEn:
        "A spacious restaurant with a summer terrace, famous for its 'Samarkand-style' plov cooked in cottonseed oil and a wide choice of kebabs. A favourite spot for local family celebrations.",
      descriptionUz:
        "Yozgi terrasaga ega keng restoran, paxta yog'ida tayyorlangan «Samarqandcha» palov va katta shashlik tanlovi bilan mashhur. Mahalliy oilalar bayramlarni nishonlaydigan joy.",
      address: "улица Registon, 5, Самарканд, Узбекистан",
      latitude: 39.6531,
      longitude: 66.9743,
      priceLevel: "MEDIUM",
      priceFrom: 80000,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "10:00", closesAt: "23:00" })),
    },
    {
      slug: "old-city-restaurant",
      categoryKey: "restaurant",
      nameRu: "Old City",
      nameEn: "Old City",
      nameUz: "Old City",
      shortDescriptionRu: "Современная кухня с видом на купола Шахи-Зинда",
      descriptionRu:
        "Ресторан европейской и паназиатской кухни на крыше здания рядом с некрополем Шахи-Зинда. Панорамная терраса, отличная винная карта и закатные виды на бирюзовые купола.",
      descriptionEn:
        "European and pan-Asian rooftop restaurant next to the Shah-i-Zinda necropolis. Panoramic terrace, a solid wine list and sunset views of the turquoise domes.",
      descriptionUz:
        "Shohizinda yaqinidagi bino tomida joylashgan yevropa va osiyo taomlari restorani. Panoramali terrasa va quyosh botishida farfor gumbazlar manzarasi.",
      address: "улица Шахи-Зинда, 12, Самарканд, Узбекистан",
      latitude: 39.6595,
      longitude: 66.9805,
      priceLevel: "HIGH",
      priceFrom: 150000,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "12:00", closesAt: "00:00" })),
    },
    {
      slug: "coffee-butik",
      categoryKey: "cafe",
      nameRu: "Coffee Butik",
      nameEn: "Coffee Butik",
      nameUz: "Coffee Butik",
      shortDescriptionRu: "Спешелти-кофейня в двух шагах от Регистана",
      descriptionRu: "Небольшая уютная кофейня со свежей обжаркой, десертами и быстрым Wi-Fi — удобная точка передышки между музеями.",
      descriptionEn: "A cosy specialty coffee shop with fresh roasts, desserts and fast Wi-Fi — a handy break between museums.",
      descriptionUz: "Yangi qovurilgan qahva, shirinliklar va tez Wi-Fi bilan mazza qiluvchi kichik kafe.",
      address: "улица Registon, 22, Самарканд, Узбекистан",
      latitude: 39.6551,
      longitude: 66.9739,
      priceLevel: "LOW",
      priceFrom: 25000,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "08:00", closesAt: "22:00" })),
    },
    {
      slug: "chashma-rooftop",
      categoryKey: "viewpoint",
      nameRu: "Смотровая площадка Chashma",
      nameEn: "Chashma Rooftop",
      nameUz: "Chashma tomi",
      shortDescriptionRu: "Лучший вид на подсвеченный вечером Регистан",
      descriptionRu: "Открытая площадка на крыше чайханы прямо напротив Регистана — идеальное место для заката и вечернего light-show на медресе.",
      descriptionEn: "An open rooftop terrace right across from Registan — perfect for sunset and the evening light show on the madrasas.",
      descriptionUz: "Registon qarshisidagi choyxona tomidagi ochiq maydoncha — quyosh botishi va kechki yorug'lik shousi uchun ideal joy.",
      address: "улица Registon, 3, Самарканд, Узбекистан",
      latitude: 39.6537,
      longitude: 66.9749,
      priceLevel: "FREE",
      priceFrom: null,
      isFeatured: true,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "09:00", closesAt: "23:00" })),
    },
    {
      slug: "siyob-bazaar",
      categoryKey: "shopping",
      nameRu: "Сиабский базар",
      nameEn: "Siyob Bazaar",
      nameUz: "Siyob bozori",
      shortDescriptionRu: "Главный восточный рынок города у стен Биби-Ханым",
      descriptionRu: "Шумный рынок специй, сухофруктов, свежего хлеба-лепёшек и текстиля прямо у стен мечети Биби-Ханым — квинтэссенция восточного колорита.",
      descriptionEn: "A bustling market of spices, dried fruit, fresh flatbread and textiles right by the walls of Bibi-Khanym — the quintessential oriental bazaar.",
      descriptionUz: "Bibixonim masjidi devorlari yonidagi ziravorlar, quritilgan mevalar, yangi non va matolar bozori — sharqona hayotning jonli aksi.",
      address: "улица Ташкентская, Самарканд, Узбекистан",
      latitude: 39.6588,
      longitude: 66.9773,
      priceLevel: "FREE",
      priceFrom: null,
      isFeatured: false,
      hours: [1, 2, 3, 4, 5, 6, 0].map((d) => ({ dayOfWeek: d, opensAt: "07:00", closesAt: "19:00" })),
    },
    {
      slug: "karvon-lounge",
      categoryKey: "nightlife",
      nameRu: "Karvon Lounge",
      nameEn: "Karvon Lounge",
      nameUz: "Karvon Lounge",
      shortDescriptionRu: "Кальян-лаунж и живая музыка на крыше в старом городе",
      descriptionRu: "Лаунж-зона с видом на подсвеченные купола, кальянами, коктейлями и живой музыкой по выходным.",
      descriptionEn: "A rooftop lounge with views of the illuminated domes, shisha, cocktails and live music on weekends.",
      descriptionUz: "Yoritilgan gumbazlar manzarasi, kalyan, kokteyllar va dam olish kunlari jonli musiqa bilan tom lounge.",
      address: "улица Registon, 8, Самарканд, Узбекистан",
      latitude: 39.6540,
      longitude: 66.9765,
      priceLevel: "MEDIUM",
      priceFrom: 60000,
      isFeatured: false,
      hours: [
        { dayOfWeek: 0, opensAt: "17:00", closesAt: "01:00" },
        { dayOfWeek: 1, opensAt: null, closesAt: null, isClosed: true },
        { dayOfWeek: 2, opensAt: "17:00", closesAt: "01:00" },
        { dayOfWeek: 3, opensAt: "17:00", closesAt: "01:00" },
        { dayOfWeek: 4, opensAt: "17:00", closesAt: "02:00" },
        { dayOfWeek: 5, opensAt: "17:00", closesAt: "02:00" },
        { dayOfWeek: 6, opensAt: "17:00", closesAt: "02:00" },
      ],
    },
  ];

  const places: Record<string, Awaited<ReturnType<typeof prisma.place.upsert>>> = {};

  for (const p of placeDefs) {
    const place = await prisma.place.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        cityId: samarkand.id,
        categoryId: categories[p.categoryKey]!.id,
        nameRu: p.nameRu,
        nameEn: p.nameEn,
        nameUz: p.nameUz,
        shortDescriptionRu: p.shortDescriptionRu,
        shortDescriptionEn: p.shortDescriptionRu,
        shortDescriptionUz: p.shortDescriptionRu,
        descriptionRu: p.descriptionRu,
        descriptionEn: p.descriptionEn,
        descriptionUz: p.descriptionUz,
        historyRu: p.historyRu,
        historyEn: p.historyEn ?? p.historyRu,
        historyUz: p.historyUz ?? p.historyRu,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        priceLevel: p.priceLevel,
        priceFrom: p.priceFrom,
        currency: "UZS",
        coverImage: img(p.slug),
        rating: 4.4 + Math.round(Math.random() * 5) / 10,
        reviewCount: 20 + Math.floor(Math.random() * 400),
        isFeatured: p.isFeatured,
        images: {
          create: [1, 2, 3].map((n) => ({ url: img(`${p.slug}-${n}`), position: n })),
        },
        openingHours: {
          create: p.hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            opensAt: h.opensAt,
            closesAt: h.closesAt,
            isClosed: h.isClosed ?? false,
          })),
        },
      },
    });
    places[p.slug] = place;
  }

  // ── Guides ────────────────────────────────────────────────────────────
  const dilnoza = await prisma.guide.upsert({
    where: { slug: "dilnoza-yusupova" },
    update: {},
    create: {
      slug: "dilnoza-yusupova",
      userId: guideUser.id,
      cityId: samarkand.id,
      name: "Dilnoza Yusupova",
      avatar: img("dilnoza", 400, 400),
      bioRu:
        "Лицензированный гид с 9-летним опытом. Специализируется на архитектуре Тимуридов и с любовью рассказывает о деталях, которые легко пропустить.",
      bioEn:
        "Licensed guide with 9 years of experience, specialising in Timurid architecture and the small details easy to miss.",
      bioUz: "9 yillik tajribaga ega litsenziyalangan gid, Temuriylar me'morchiligi bo'yicha mutaxassis.",
      languages: ["ru", "en", "uz"],
      experienceYears: 9,
      pricePerHour: 180000,
      isVerified: true,
      rating: 4.9,
      reviewCount: 132,
      places: { connect: [{ id: places["registan"]!.id }, { id: places["gur-e-amir"]!.id }] },
    },
  });

  const azizGuide = await prisma.guide.upsert({
    where: { slug: "aziz-karimov" },
    update: {},
    create: {
      slug: "aziz-karimov",
      cityId: samarkand.id,
      name: "Aziz Karimov",
      avatar: img("aziz-guide", 400, 400),
      bioRu: "Историк по образованию, проводит вечерние и фотопрогулки по некрополю Шахи-Зинда и мечети Биби-Ханым.",
      bioEn: "A historian by training, running evening and photo walks around Shah-i-Zinda and Bibi-Khanym.",
      bioUz: "Tarixchi, Shohizinda va Bibixonim atrofida kechki va foto sayohatlar o'tkazadi.",
      languages: ["ru", "en"],
      experienceYears: 6,
      pricePerHour: 150000,
      isVerified: true,
      rating: 4.8,
      reviewCount: 87,
      places: { connect: [{ id: places["shahi-zinda"]!.id }, { id: places["bibi-khanym"]!.id }] },
    },
  });

  const johnGuide = await prisma.guide.upsert({
    where: { slug: "john-peterson" },
    update: {},
    create: {
      slug: "john-peterson",
      cityId: samarkand.id,
      name: "John Peterson",
      avatar: img("john-guide", 400, 400),
      bioRu: "Экспат из Великобритании, живёт в Самарканде 5 лет. Ведёт экскурсии на английском для иностранных туристов.",
      bioEn: "A British expat living in Samarkand for 5 years, running English-language tours for foreign visitors.",
      bioUz: "5 yildan beri Samarqandda yashovchi britaniyalik, xorijiy sayyohlar uchun ingliz tilida ekskursiyalar.",
      languages: ["en"],
      experienceYears: 5,
      pricePerHour: 200000,
      isVerified: true,
      rating: 4.7,
      reviewCount: 54,
      places: { connect: [{ id: places["registan"]!.id }] },
    },
  });

  const feruza = await prisma.guide.upsert({
    where: { slug: "feruza-rakhimova" },
    update: {},
    create: {
      slug: "feruza-rakhimova",
      cityId: samarkand.id,
      name: "Feruza Rakhimova",
      avatar: img("feruza-guide", 400, 400),
      bioRu: "Гастрономический гид, знает лучшие места для плова, самсы и восточных сладостей. Говорит по-японски.",
      bioEn: "A food-focused guide who knows the best spots for plov, samsa and Uzbek sweets. Speaks Japanese.",
      bioUz: "Palov, somsa va milliy shirinliklar bo'yicha gastronomik gid. Yapon tilida so'zlashadi.",
      languages: ["ru", "uz", "ja"],
      experienceYears: 4,
      pricePerHour: 140000,
      isVerified: false,
      rating: 4.6,
      reviewCount: 29,
      places: { connect: [{ id: places["siyob-bazaar"]!.id }, { id: places["karimbek-restaurant"]!.id }] },
    },
  });

  for (const guide of [dilnoza, azizGuide, johnGuide, feruza]) {
    for (const dayOffset of [1, 2, 3]) {
      await prisma.guideAvailability.create({
        data: {
          guideId: guide.id,
          startAt: daysFromNowAt(dayOffset, 9 + dayOffset),
          endAt: daysFromNowAt(dayOffset, 12 + dayOffset),
          capacity: 6,
          bookedCount: dayOffset === 1 ? 2 : 0,
        },
      });
    }
  }

  // ── Tours / excursions ───────────────────────────────────────────────
  const tourDefs = [
    {
      slug: "registan-time-travel",
      placeSlug: "registan",
      guideId: dilnoza.id,
      titleRu: "Регистан: путешествие во времени",
      titleEn: "Registan: A Journey Through Time",
      titleUz: "Registon: vaqt sayohati",
      descriptionRu: "Пешая экскурсия по трём медресе Регистана с разбором архитектурных деталей и историй эпохи Тимуридов.",
      descriptionEn: "A walking tour of Registan's three madrasas, unpacking architectural details and Timurid-era stories.",
      descriptionUz: "Registonning uchta madrasasi bo'ylab piyoda ekskursiya.",
      durationMinutes: 90,
      price: 250000,
      maxGroupSize: 10,
    },
    {
      slug: "shahi-zinda-secrets",
      placeSlug: "shahi-zinda",
      guideId: azizGuide.id,
      titleRu: "Шахи-Зинда: тайны голубых куполов",
      titleEn: "Shah-i-Zinda: Secrets of the Blue Domes",
      titleUz: "Shohizinda: moviy gumbazlar siri",
      descriptionRu: "Медленная прогулка по аллее мавзолеев с рассказом о резной майолике и легендах некрополя.",
      descriptionEn: "A slow walk down the avenue of mausoleums, covering carved majolica and necropolis legends.",
      descriptionUz: "Maqbaralar ko'chasi bo'ylab sayohat.",
      durationMinutes: 75,
      price: 200000,
      maxGroupSize: 8,
    },
    {
      slug: "taste-of-samarkand",
      placeSlug: "siyob-bazaar",
      guideId: feruza.id,
      titleRu: "Вкус Самарканда: гастрономический тур",
      titleEn: "Taste of Samarkand: A Food Tour",
      titleUz: "Samarqand ta'mi: gastronomik tur",
      descriptionRu: "Дегустация плова, самсы и восточных сладостей на Сиабском базаре и в лучших чайханах города.",
      descriptionEn: "Tasting plov, samsa and Uzbek sweets at Siyob Bazaar and the city's best teahouses.",
      descriptionUz: "Siyob bozori va eng yaxshi choyxonalarda palov, somsa va shirinliklarni tatib ko'rish.",
      durationMinutes: 150,
      price: 320000,
      maxGroupSize: 6,
    },
    {
      slug: "evening-samarkand",
      placeSlug: "registan",
      guideId: johnGuide.id,
      titleRu: "Вечерний Самарканд: архитектура и свет",
      titleEn: "Evening Samarkand: Architecture and Light",
      titleUz: "Kechki Samarqand: me'morchilik va yorug'lik",
      descriptionRu: "Прогулка на закате с остановкой на вечернем light-show на площади Регистан.",
      descriptionEn: "A sunset walk ending with the evening light show on Registan square.",
      descriptionUz: "Registon maydonidagi kechki yorug'lik shousi bilan yakunlanuvchi sayohat.",
      durationMinutes: 120,
      price: 280000,
      maxGroupSize: 12,
    },
  ];

  for (const t of tourDefs) {
    const tour = await prisma.tour.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        placeId: places[t.placeSlug]!.id,
        guideId: t.guideId,
        titleRu: t.titleRu,
        titleEn: t.titleEn,
        titleUz: t.titleUz,
        descriptionRu: t.descriptionRu,
        descriptionEn: t.descriptionEn,
        descriptionUz: t.descriptionUz,
        coverImage: img(t.slug),
        durationMinutes: t.durationMinutes,
        price: t.price,
        maxGroupSize: t.maxGroupSize,
        availabilities: {
          create: [1, 2, 4].map((dayOffset) => ({
            startAt: daysFromNowAt(dayOffset, 10),
            capacity: t.maxGroupSize,
            bookedCount: dayOffset === 1 ? Math.min(3, t.maxGroupSize) : 0,
          })),
        },
      },
    });

    if (t.slug === "registan-time-travel") {
      const slot = await prisma.tourAvailability.findFirst({
        where: { tourId: tour.id },
        orderBy: { startAt: "asc" },
      });
      if (slot) {
        await prisma.booking.create({
          data: {
            userId: demoUser.id,
            type: "TOUR",
            status: "CONFIRMED",
            tourId: tour.id,
            tourAvailabilityId: slot.id,
            quantity: 2,
            totalPrice: t.price * 2,
            contactName: demoUser.name ?? "Гость",
            contactPhone: "+998901234567",
          },
        });
      }
    }
  }

  // ── Events — the "live city" layer ──────────────────────────────────
  const eventDefs = [
    {
      slug: "sharq-taronalari-open-air",
      categoryKey: "concert",
      placeSlug: "registan",
      titleRu: "Шарк Тароналари: концерт под открытым небом",
      titleEn: "Sharq Taronalari: Open-Air Concert",
      titleUz: "Sharq taronalari: ochiq havoda konsert",
      descriptionRu: "Выступление фольклорных и джазовых ансамблей на фоне подсвеченных медресе Регистана в рамках международного музыкального фестиваля.",
      descriptionEn: "Folk and jazz ensembles performing against the illuminated madrasas of Registan as part of the international music festival.",
      descriptionUz: "Xalqaro musiqa festivali doirasida Registon madrasalari fonida folklor va jaz ansambllari chiqishi.",
      organizer: "Самаркандская филармония",
      startInHours: 3,
      durationHours: 3,
      tickets: [
        { name: "Стандарт", price: 120000, totalQuantity: 300 },
        { name: "VIP", price: 350000, totalQuantity: 60 },
      ],
    },
    {
      slug: "silk-road-samarkand-festival",
      categoryKey: "festival",
      placeSlug: "siyob-bazaar",
      titleRu: "Фестиваль Silk Road Samarkand",
      titleEn: "Silk Road Samarkand Festival",
      titleUz: "Silk Road Samarqand festivali",
      descriptionRu: "Многодневный городской фестиваль ремёсел, музыки и уличной еды, объединяющий мастеров со всего Узбекистана.",
      descriptionEn: "A multi-day city festival of crafts, music and street food bringing together artisans from across Uzbekistan.",
      descriptionUz: "Butun O'zbekistondan hunarmandlarni birlashtiruvchi ko'p kunlik hunarmandchilik, musiqa va ko'cha taomlari festivali.",
      organizer: "Хокимият Самарканда",
      startInHours: -20,
      durationHours: 4 * 24,
      tickets: [{ name: "Вход", price: 0, totalQuantity: 5000 }],
    },
    {
      slug: "miniature-calligraphy-exhibition",
      categoryKey: "exhibition",
      placeSlug: "ulugbek-observatory",
      titleRu: "Выставка миниатюры и каллиграфии",
      titleEn: "Miniature & Calligraphy Exhibition",
      titleUz: "Miniatyura va xattotlik ko'rgazmasi",
      descriptionRu: "Работы современных художников-миниатюристов Самарканда и Бухары, вдохновлённые астрономическим наследием Улугбека.",
      descriptionEn: "Works by contemporary Samarkand and Bukhara miniature artists, inspired by Ulugbek's astronomical legacy.",
      descriptionUz: "Ulug'bekning astronomik merosidan ilhomlangan zamonaviy miniatyurachi rassomlar ishlari.",
      organizer: "Музей истории Самарканда",
      startInHours: 30,
      durationHours: 10 * 24,
      tickets: [{ name: "Билет", price: 40000, totalQuantity: 200 }],
    },
    {
      slug: "rishtan-ceramics-masterclass",
      categoryKey: "masterclass",
      placeSlug: "siyob-bazaar",
      titleRu: "Мастер-класс по риштанской керамике",
      titleEn: "Rishtan Ceramics Masterclass",
      titleUz: "Rishton kulolchiligi bo'yicha master-klass",
      descriptionRu: "Учимся расписывать традиционную керамику узбекскими орнаментами под руководством мастера-керамиста.",
      descriptionEn: "Learn to hand-paint traditional ceramics with Uzbek ornaments, guided by a master potter.",
      descriptionUz: "Usta kulol rahbarligida an'anaviy sopol buyumlarni bezash.",
      organizer: "Ремесленная мастерская Sato",
      startInHours: 26,
      durationHours: 2,
      tickets: [{ name: "Участие + материалы", price: 180000, totalQuantity: 15 }],
    },
    {
      slug: "shashmaqom-evening",
      categoryKey: "concert",
      placeSlug: "bibi-khanym",
      titleRu: "Вечер макомов Шашмаком",
      titleEn: "An Evening of Shashmaqom",
      titleUz: "Shashmaqom kechasi",
      descriptionRu: "Живое исполнение классического узбекско-таджикского макомного искусства, включённого в список ЮНЕСКО.",
      descriptionEn: "A live performance of classical Uzbek-Tajik Shashmaqom music, inscribed on the UNESCO heritage list.",
      descriptionUz: "YUNESKO ro'yxatiga kiritilgan klassik shashmaqom san'atining jonli ijrosi.",
      organizer: "Дом традиционной музыки",
      startInHours: 1,
      durationHours: 2,
      tickets: [{ name: "Билет", price: 90000, totalQuantity: 120 }],
    },
  ];

  for (const e of eventDefs) {
    const startAt = hoursFromNow(e.startInHours);
    const endAt = hoursFromNow(e.startInHours + e.durationHours);
    const place = places[e.placeSlug]!;

    const event = await prisma.event.upsert({
      where: { slug: e.slug },
      update: { startAt, endAt },
      create: {
        slug: e.slug,
        cityId: samarkand.id,
        categoryId: categories[e.categoryKey]!.id,
        placeId: place.id,
        titleRu: e.titleRu,
        titleEn: e.titleEn,
        titleUz: e.titleUz,
        descriptionRu: e.descriptionRu,
        descriptionEn: e.descriptionEn,
        descriptionUz: e.descriptionUz,
        coverImage: img(e.slug),
        organizer: e.organizer,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        startAt,
        endAt,
        isFeatured: e.categoryKey === "festival" || e.categoryKey === "concert",
        rating: 4.5 + Math.round(Math.random() * 4) / 10,
        reviewCount: 5 + Math.floor(Math.random() * 80),
        images: { create: [1, 2].map((n) => ({ url: img(`${e.slug}-${n}`), position: n })) },
        ticketTypes: { create: e.tickets },
      },
    });

    if (e.slug === "sharq-taronalari-open-air") {
      const ticket = await prisma.eventTicketType.findFirst({ where: { eventId: event.id } });
      if (ticket) {
        await prisma.booking.create({
          data: {
            userId: demoUser.id,
            type: "EVENT",
            status: "CONFIRMED",
            eventId: event.id,
            eventTicketTypeId: ticket.id,
            quantity: 2,
            totalPrice: ticket.price * 2,
            contactName: demoUser.name ?? "Гость",
            contactPhone: "+998901234567",
          },
        });
        await prisma.eventTicketType.update({
          where: { id: ticket.id },
          data: { soldQuantity: { increment: 2 } },
        });
      }
    }
  }

  // ── Favorites & reviews for the demo account ────────────────────────
  await prisma.favoritePlace.upsert({
    where: { userId_placeId: { userId: demoUser.id, placeId: places["registan"]!.id } },
    update: {},
    create: { userId: demoUser.id, placeId: places["registan"]!.id },
  });
  await prisma.favoritePlace.upsert({
    where: { userId_placeId: { userId: demoUser.id, placeId: places["chashma-rooftop"]!.id } },
    update: {},
    create: { userId: demoUser.id, placeId: places["chashma-rooftop"]!.id },
  });

  const firstEvent = await prisma.event.findUnique({ where: { slug: "sharq-taronalari-open-air" } });
  if (firstEvent) {
    await prisma.favoriteEvent.upsert({
      where: { userId_eventId: { userId: demoUser.id, eventId: firstEvent.id } },
      update: {},
      create: { userId: demoUser.id, eventId: firstEvent.id },
    });
  }

  await prisma.review.createMany({
    data: [
      {
        userId: demoUser.id,
        placeId: places["registan"]!.id,
        rating: 5,
        comment: "Невероятное место, особенно на закате. Обязательно возьмите гида — детали того стоят.",
      },
      {
        userId: demoUser.id,
        placeId: places["shahi-zinda"]!.id,
        rating: 5,
        comment: "Атмосфера как в другом мире. Майолика на солнце — отдельный вид искусства.",
      },
      {
        userId: admin.id,
        guideId: dilnoza.id,
        rating: 5,
        comment: "Dilnoza знает невероятное количество деталей об архитектуре Тимуридов.",
      },
    ],
    skipDuplicates: true,
  });

  // Keep aggregate rating/reviewCount roughly consistent with seeded reviews.
  for (const slug of ["registan", "shahi-zinda"]) {
    const count = await prisma.review.count({ where: { placeId: places[slug]!.id } });
    if (count > 0) {
      await prisma.place.update({ where: { id: places[slug]!.id }, data: { reviewCount: { increment: count } } });
    }
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
