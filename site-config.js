// Yeni kayıtları aşağıdaki contentTemplates örneklerinden oluşturun.
// status: "draft" kayıtları sitede görünmez; hazır olduğunda "published" yapın.
export const siteConfig = {
  school: {
    name: "İSTEK Ankara Okulları",
    url: "https://ankara.istek.k12.tr/tr",
  },
  // Site yayına çıktığında gerçek HTTPS alan adını yazın; yerelde boş bırakın.
  siteUrl: "",
  seasonStatus: "İlk FIRST Robotics Competition sezonumuza hazırlanıyoruz.",
  season: {
    year: 2027,
    status: "Sezon hazırlıkları",
    updatedAt: "2026-11-16",
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
      status: "draft",
      name: "Mekanik",
      description: "Robotun şasisini ve mekanizmalarını tasarlar, parçaları üretir ve montajı yapar.",
      en: {
        name: "Mechanical",
        description: "Designs the robot chassis and mechanisms, fabricates parts, and assembles the robot.",
      },
    },
    {
      status: "draft",
      name: "Yazılım",
      description: "Sürücü kontrollerini, otonom hareketleri ve sensörlerden gelen verileri işleyen kodu yazar ve test eder.",
      en: {
        name: "Software",
        description: "Writes and tests the code for driver controls, autonomous routines, and sensor data processing.",
      },
    },
    {
      status: "draft",
      name: "Elektrik",
      description: "Güç dağıtımını planlar, motor ve sensör bağlantılarını yapar ve kabloları kontrol eder.",
      en: {
        name: "Electrical",
        description: "Plans power distribution, connects motors and sensors, and checks the wiring.",
      },
    },
    {
      status: "draft",
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
  sponsorshipFile: "",
  events: [
    {
      title: "Ankara Regional",
      date: "19–21 Mart 2027",
      startDate: "2027-03-19",
      endDate: "2027-03-21",
      location: "ODTÜ GVO Lisesi Spor Salonu, Çankaya / Ankara",
      url: "https://frc-events.firstinspires.org/2027/TUAK",
      status: "published",
      en: {
        date: "March 19–21, 2027",
        location: "ODTÜ GVO High School Sports Hall, Çankaya, Ankara",
      },
    },
  ],
  faq: [],

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
  news: { status: "draft", slug: "haber-basligi", title: "", category: "Takımdan", date: "", summary: "", paragraphs: [], image: "", imageAlt: "", imageWidth: 1600, imageHeight: 1000 },
  resource: { status: "draft", title: "", topic: "Yazılım", category: "", year: "", level: "Başlangıç", description: "", format: "PDF", url: "", download: false, en: { title: "", topic: "Software", category: "", level: "Beginner", description: "" } },
  person: { status: "draft", name: "", role: "", team: "", image: "", imageAlt: "", imageWidth: 600, imageHeight: 750 },
  history: { status: "draft", year: "", title: "", description: "", robotSlug: "", image: "" },
  award: { status: "draft", year: "", title: "", event: "", url: "" },
  photo: { status: "draft", src: "", alt: "", caption: "", category: "Takım", width: 1600, height: 1000 },
  video: { status: "draft", title: "", category: "Robot", url: "", thumbnail: "", description: "" },
  event: { status: "draft", title: "", date: "", startDate: "", endDate: "", location: "", url: "" },
  faq: { status: "draft", question: "", answer: "" },
  subteam: { status: "draft", name: "", description: "", en: { name: "", description: "" } },
};
