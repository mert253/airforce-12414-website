// Yeni kayıtları aşağıdaki contentTemplates örneklerinden oluşturun.
// status: "draft" kayıtları sitede görünmez; hazır olduğunda "published" yapın.
export const siteConfig = {
  school: {
    name: "İSTEK Ankara Okulları",
    url: "https://ankara.istek.k12.tr/tr",
  },
  // Asıl adres. team12414.org, vercel.json içinde bu adrese yönlendirilir.
  siteUrl: "https://team12414.com",
  seasonStatus: "İlk FIRST Robotics Competition sezonumuza hazırlanıyoruz.",
  season: {
    year: 2027,
    status: "Sezon hazırlıkları",
    updatedAt: "2026-11-23",
    description: "İlk FIRST Robotics Competition sezonumuz için hazırlanıyoruz.",
  },
  firstProfile: "https://frc-events.firstinspires.org/2027/team/12414",
  teamPhoto: "",
  teamPhotoAlt: "AIR FORCE 12414 takım fotoğrafı",
  // Fotoğrafın gerçek piksel ölçülerini dosyayla birlikte güncelleyin.
  teamPhotoWidth: 1600,
  teamPhotoHeight: 900,
  teamPhotoPosition: "center",
  // Ek fotoğraflar için contentTemplates.photo örneğini kullanın.
  gallery: [],
  instagram: "https://www.instagram.com/airforce12414/",
  email: "airforce@istek.k12.tr",
  emailIsPlaceholder: false,

  history: [],
  students: [],
  mentors: [],
  subteams: [
    {
      status: "published",
      name: "Mekanik",
      description: "Robotun şasisini ve mekanizmalarını tasarlar, parçaları üretir ve montajı yapar.",
      en: {
        name: "Mechanical",
        description: "Designs the robot chassis and mechanisms, fabricates parts, and assembles the robot.",
      },
    },
    {
      status: "published",
      name: "Yazılım",
      description: "Sürücü kontrollerini, otonom hareketleri ve sensörlerden gelen verileri işleyen kodu yazar ve test eder.",
      en: {
        name: "Software",
        description: "Writes and tests the code for driver controls, autonomous routines, and sensor data processing.",
      },
    },
    {
      status: "published",
      name: "Elektrik",
      description: "Güç dağıtımını planlar, motor ve sensör bağlantılarını yapar ve kabloları kontrol eder.",
      en: {
        name: "Electrical",
        description: "Plans power distribution, connects motors and sensors, and checks the wiring.",
      },
    },
    {
      status: "published",
      name: "Proje yönetimi",
      description: "Görevleri ve takvimi takip eder, malzeme ihtiyaçlarını koordine eder ve ekipler arasındaki iletişimi yürütür.",
      en: {
        name: "Project management",
        description: "Tracks tasks and deadlines, coordinates material needs, and keeps the work areas in sync.",
      },
    },
  ],
  awards: [],

  // En yeni robotu ilk sıraya koyun. Alan örnekleri ICERIK.md dosyasında.
  robots: [],
  projects: [],
  resources: [],
  news: [],
  videos: [],

  sponsors: [],
  schoolMark: { name: "İSTEK Ankara Okulları", logo: "/assets/sponsors/istek-ankara-logo.png", url: "https://ankara.istek.k12.tr/tr", role: "Okulumuz", width: 564, height: 154 },
  frcOrganizer: {
    name: "Fikret Yüksel Eğitim Vakfı",
    logo: "/assets/sponsors/fikret-yuksel-egitim-vakfi.png",
    url: "https://fyf.org.tr/hakkimizda/",
    role: "Türkiye’de FRC organizatörü",
    width: 300,
    height: 288,
  },
  // Sponsorluk seviyeleri ve dosyası hazır olduğunda doldurun; boşken sayfada hiçbir şey görünmez.
  // Örnekler contentTemplates.sponsorshipTier ve contentTemplates.sponsorshipPdf içinde.
  sponsorshipTiers: [],
  sponsorshipPdf: null,
  sponsorNeeds: [
    {
      title: "Robot ve atölye",
      description: "Robot geliştirme sürecinde kullanılacak parçalar, malzemeler ve ekipman.",
      examples: ["Mekanik ve elektronik bileşenler", "El aletleri ve sarf malzemeleri"],
      en: {
        title: "Robot and workshop",
        description: "Parts, materials, and tools for developing the robot.",
        examples: ["Mechanical and electronic components", "Hand tools and consumables"],
      },
    },
    {
      title: "Üretim ve teknik destek",
      description: "Tasarımların üretime dönüşmesi için imalat hizmeti ve uzmanlık desteği.",
      examples: ["Parça işleme ve kesim", "İmalat ve teknik danışmanlık"],
      en: {
        title: "Fabrication and technical support",
        description: "Manufacturing services and technical expertise to turn designs into working parts.",
        examples: ["Machining and cutting", "Manufacturing and technical advice"],
      },
    },
    {
      title: "Yarışma ve ulaşım",
      description: "Takımın yarışma sürecindeki kayıt, taşıma ve ulaşım ihtiyaçları.",
      examples: ["Yarışma kaydı", "Robotun taşınması ve takımın ulaşımı"],
      en: {
        title: "Competition and travel",
        description: "Support for event registration, robot transport, and team travel.",
        examples: ["Event registration", "Robot transport and team travel"],
      },
    },
  ],
  events: [
    {
      slug: "ankara-regional",
      title: "Ankara Regional",
      summary: "AIR FORCE #12414’ün ilk FIRST Robotics Competition sezonundaki ilk resmî etkinliği.",
      city: "Ankara",
      country: "TR",
      date: "19–21 Mart 2027",
      startDate: "2027-03-19",
      endDate: "2027-03-21",
      location: "ODTÜ GVO Lisesi Spor Salonu, Çankaya / Ankara",
      url: "https://frc-events.firstinspires.org/2027/TUAK",
      status: "published",
      // Program, sonuç ve fotoğraflar yalnızca onaylı bilgiyle doldurulur (contentTemplates.eventProgramItem, eventResult, photo).
      program: [],
      results: [],
      photos: [],
      en: {
        date: "19–21 March 2027",
        location: "ODTÜ GVO High School Sports Hall, Çankaya, Ankara",
        summary: "The first official event of AIR FORCE #12414’s first FIRST Robotics Competition season.",
      },
    },
  ],
  faq: [
    {
      status: "published",
      question: "AIR FORCE #12414 nedir?",
      answer: "AIR FORCE #12414 (Ankara İstech Robotics Force), İSTEK Ankara Okulları bünyesinde kurulan ve 2027 sezonunda ilk kez FIRST Robotics Competition’da yarışmaya hazırlanan lise robotik takımıdır.",
      en: {
        question: "What is AIR FORCE #12414?",
        answer: "AIR FORCE #12414 (Ankara İstech Robotics Force) is the high school robotics team of İSTEK Ankara Schools, preparing to compete in our first FIRST Robotics Competition season in 2027.",
      },
    },
    {
      status: "published",
      question: "FIRST Robotics Competition (FRC) nasıl bir yarışmadır?",
      answer: "FRC, lise öğrencilerinin mentorlarıyla birlikte her sezon açıklanan yeni bir mühendislik problemi için endüstriyel ölçekte robot tasarladığı, ürettiği, programladığı ve sahada ittifaklar halinde yarıştığı uluslararası bir robotik programıdır.",
      en: {
        question: "What is FIRST Robotics Competition (FRC)?",
        answer: "FRC is an international robotics program where high school students work alongside mentors to design, build, and program industrial-scale robots for a new engineering challenge each season, competing on the field in alliances.",
      },
    },
    {
      status: "published",
      question: "İlk yarışmanız ne zaman ve nerede?",
      answer: "2027 sezonundaki ilk etkinliğimiz 19–21 Mart 2027 tarihlerinde Ankara’da, ODTÜ GVO Lisesi Spor Salonu’nda düzenlenecek olan Ankara Regional’dır.",
      en: {
        question: "When and where is your first competition?",
        answer: "Our first event of the 2027 season is the Ankara Regional, taking place on 19–21 March 2027 at ODTÜ GVO High School Sports Hall in Çankaya, Ankara.",
      },
    },
    {
      status: "published",
      question: "Takıma nasıl sponsor veya destek olabiliriz?",
      answer: "Robot parçaları, atölye ekipmanları, üretim/imalat hizmetleri, teknik danışmanlık veya yarışma ve ulaşım giderleri için destek sağlayabilirsiniz. Destek seçeneklerini Sponsor olun sayfamızda inceleyebilir ve airforce@istek.k12.tr adresinden bize ulaşabilirsiniz.",
      en: {
        question: "How can we sponsor or support the team?",
        answer: "You can support us with robot parts, workshop equipment, fabrication services, technical mentoring, or competition and travel expenses. See our Sponsor the team page or email us at airforce@istek.k12.tr.",
      },
    },
    {
      status: "published",
      question: "Takımın çalışmalarını nasıl takip edebiliriz?",
      answer: "Güncel sezon durumumuzu ve yarışma takvimimizi bu siteden, atölye ve etkinlik paylaşımlarımızı ise Instagram’daki @airforce12414 hesabımızdan takip edebilirsiniz.",
      en: {
        question: "How can we follow the team’s progress?",
        answer: "You can follow our season status and competition schedule right here on our website, and see updates from the workshop and events on Instagram at @airforce12414.",
      },
    },
  ],

  en: {
    school: { name: "İSTEK Ankara Schools" },
    seasonStatus: "We’re preparing for our first FIRST Robotics Competition season.",
    season: {
      status: "Season preparations",
      description: "We’re preparing for our first FIRST Robotics Competition season.",
    },
    teamPhotoAlt: "AIR FORCE 12414 team photo",
    schoolMark: { name: "İSTEK Ankara Schools", role: "Our school" },
    frcOrganizer: { name: "Fikret Yüksel Education Foundation", role: "FRC organizer in Türkiye" },
  },
};

// Bu örnekler yayımlanan içerik değildir. İlgili listeye kopyalayıp doldurun.
export const contentTemplates = {
  robot: { status: "draft", slug: "robot-adi", name: "", year: "", game: "", description: "", image: "", imageAlt: "", imageWidth: 1600, imageHeight: 1000, mechanisms: [], specs: [], results: [], photos: [], cadUrl: "", codeUrl: "", videoUrl: "", gameUrl: "" },
  project: { status: "draft", slug: "proje-adi", title: "", category: "Eğitim", date: "", goal: "", audience: "", description: "", results: "", image: "", imageAlt: "", imageWidth: 1600, imageHeight: 1000, evidenceUrl: "", photos: [] },
  // category: Takımdan | Özel Günler | FRC Gelişmeleri | Teknik
  news: { status: "draft", slug: "yazi-basligi", title: "", category: "Takımdan", date: "", summary: "", paragraphs: [], image: "", imageAlt: "", imageWidth: 1600, imageHeight: 1000 },
  resource: { status: "draft", title: "", topic: "Yazılım", category: "", year: "", level: "Başlangıç", description: "", format: "PDF", url: "", download: false, en: { title: "", topic: "Software", category: "", level: "Beginner", description: "" } },
  person: { status: "draft", name: "", role: "", team: "", image: "", imageAlt: "", imageWidth: 600, imageHeight: 750 },
  history: { status: "draft", year: "", title: "", description: "", robotSlug: "", image: "" },
  award: { status: "draft", year: "", title: "", event: "", url: "" },
  photo: { status: "draft", src: "", alt: "", caption: "", category: "Takım", album: "", width: 1600, height: 1000 },
  video: { status: "draft", title: "", category: "Robot", url: "", thumbnail: "", description: "" },
  event: { status: "draft", slug: "etkinlik-adi", title: "", summary: "", date: "", startDate: "", endDate: "", location: "", city: "", country: "TR", url: "", program: [], results: [], photos: [], en: { date: "", location: "", summary: "" } },
  eventProgramItem: { status: "draft", date: "2027-03-19", time: "", title: "", description: "", en: { title: "", description: "" } },
  eventResult: { status: "draft", label: "", result: "", url: "", en: { label: "", result: "" } },
  faq: { status: "draft", question: "", answer: "" },
  sponsorshipTier: { status: "draft", name: "", amount: "", description: "", benefits: [], en: { name: "", amount: "", description: "", benefits: [] } },
  sponsorshipPdf: { status: "draft", label: "Sponsorluk dosyası", url: "/assets/sponsorluk.pdf", en: { label: "Sponsorship file" } },
  subteam: { status: "draft", name: "", description: "", en: { name: "", description: "" } },
};
