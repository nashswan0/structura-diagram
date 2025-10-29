export type Language = 'EN' | 'ID';

export const translations = {
  EN: {
  navbar: {
    home: 'Home',
    features: 'Features',
    howItWorks: 'How It Works',
    documentation: 'Documentation',
    login: 'Log In',
    logout: 'Log Out',
    tryNow: 'Try Now',
    language: 'Language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  },
  auth: {
    signInWithGoogle: 'Sign in with Google',
    loggingIn: 'Logging in...',
    tokenWarning: 'Token Warning',
    outOfTokens: 'Out of Tokens!',
    tokensRemaining: 'tokens remaining',
    tokensLabel: 'Tokens',
    noTokensMessage: "You've used all your free tokens (0 tokens left).",
    waitForReset: 'You can still manually edit diagrams in the visual editor.',
  },
    hero: {
      badge: 'Powered by Built-in AI',
      title: 'Visualize Your Ideas',
      titleHighlight: 'Intelligently',
      description: 'The next-generation AI-powered diagram creator — built for developers, students, and creators. Effortlessly design flowcharts, UMLs, ERDs, and many more in seconds.',
      launchButton: 'Launch Diagram Builder',
      viewExamples: 'View Examples',
    },
    stats: {
      generation: {
        value: '5–10s',
        label: 'Diagram Generation',
        tooltip: 'Generate professional diagrams in just 5-10 seconds',
      },
      types: {
        value: '25+',
        label: 'Diagram Types Supported',
        tooltip: 'UML, Flowchart, ERD, Architecture & 22 more diagram types',
      },
      tokens: {
        value: '10',
        label: 'Free Usage',
        tooltip: 'Generate up to 10 diagrams using our built-in AI',
      },
      aiHandling: {
        value: 'Smart AI',
        label: 'AI Error Handling',
        tooltip: 'Intelligent error detection and automatic code fixing',
      },
    },
    features: {
      title: 'What Makes Structura',
      titleHighlight: 'Different?',
      subtitle: 'Powerful features designed to make diagram creation effortless and enjoyable',
      multiDiagram: {
        title: 'Multi-Diagram Support',
        description: 'Create flowcharts, class diagrams, sequence diagrams, and ERDs with ease.',
      },
      aiEngine: {
        title: 'Built-in AI Engine',
        description: 'No external API needed. Our AI transforms your text into diagrams instantly.',
      },
      creativeInterface: {
        title: 'Creative Interface',
        description: 'Modern UI with gradient design and smooth animations for a delightful experience.',
      },
      fastRendering: {
        title: 'Fast & Smart Rendering',
        description: 'Generates diagram code instantly and visualizes it dynamically in real-time.',
      },
      webBased: {
        title: 'Web-Based & Free',
        description: 'No installation required. Access anywhere, anytime from any device.',
      },
      export: {
        title: 'Export Options',
        description: 'Download your diagrams as SVG or PNG for presentations and documentation.',
      },
    },
    useCases: {
      title: 'Built for Every Creator',
      subtitle: 'Structura Diagram adapts to your workflow — from academic projects to professional systems.',
      students: {
        title: 'Students & Educators',
        description: 'Learn and teach UML or ERD visually.',
      },
      developers: {
        title: 'Developers & Engineers',
        description: 'Design systems faster than ever.',
      },
      researchers: {
        title: 'Researchers & Designers',
        description: 'Map out frameworks with clarity.',
      },
      teams: {
        title: 'Teams & Projects',
        description: 'Collaborate on ideas effortlessly.',
      },
    },
    exampleGallery: {
      title: 'Example Gallery',
      subtitle: 'Get inspired by real-world diagram examples',
      flowchart: {
        title: 'Flowchart',
        subtitle: 'Login Process',
        description: 'User authentication flow visualization',
      },
      classDiagram: {
        title: 'Class Diagram',
        subtitle: 'Library System',
        description: 'Object-oriented system design',
      },
      sequenceDiagram: {
        title: 'Sequence Diagram',
        subtitle: 'User Registration',
        description: 'Interactive process mapping',
      },
      erd: {
        title: 'ERD',
        subtitle: 'E-commerce Database',
        description: 'Database relationship modeling',
      },
    },
    howItWorks: {
      title: 'How It',
      titleHighlight: 'Works',
      subtitle: 'Four simple steps to create professional diagrams',
      describe: {
        title: 'Describe Your Idea',
        description: 'Simply type what diagram you need, like \'create a class diagram for a library system\'.',
      },
      aiInterprets: {
        title: 'AI Interprets',
        description: 'Our built-in AI understands your input and generates the diagram code automatically.',
      },
      rendering: {
        title: 'Real-time Rendering',
        description: 'Structura renders your diagram visually in real-time with beautiful formatting.',
      },
      edit: {
        title: 'Edit & Refine',
        description: 'Adjust nodes, edges, and labels as needed. Export when you\'re satisfied.',
      },
    },
    supportedDiagrams: {
      title: '25+ Supported',
      titleHighlight: 'Diagram Types',
      subtitle: 'From flowcharts to architecture diagrams, create any visualization you need',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about Structura Diagram',
      items: [
        {
          question: 'What is Structura Diagram?',
          answer: 'Structura Diagram is an AI-powered web tool that helps you create professional diagrams such as flowcharts, UMLs, sequence diagrams, ERDs, and 13+ more types of diagrams. All generated instantly from simple text prompts.',
        },
        {
          question: 'How does the built-in AI work?',
          answer: 'Our built-in AI engine interprets your text descriptions and automatically transforms them into visual diagram code. No external API or setup is needed. Simply type your idea, and Structura visualizes it in real time.',
        },
        {
          question: 'Do I need any design or coding experience?',
          answer: 'Not at all! Structura Diagram is built for everyone, from students and beginners to professionals. If you can describe your idea in words, Structura can turn it into a clear, professional diagram.',
        },
        {
          question: 'Do I need an account to use Structura Diagram?',
          answer: 'Yes, you\'ll need to log in with your Google account to access the diagram builder. Structura uses Google login for secure and seamless access, no manual signup or password needed.',
        },
        {
          question: 'Is Structura Diagram free to use?',
          answer: 'Yes! Structura Diagram is free to use with 10 free one-time AI-generated diagrams. We plan to introduce premium plans in the future with higher limits and additional benefits.',
        },
        {
          question: 'Can I export my diagrams?',
          answer: 'Yes. You can export your diagrams as SVG files. Perfect for presentations, reports, and documentation.',
        },
        {
          question: 'How accurate is the AI diagram generation?',
          answer: 'Our AI is trained to interpret structural relationships and diagram syntax with high accuracy, ensuring clear and professional results every time.',
        },
        {
          question: 'What happens if my tokens run out?',
          answer: 'Each AI-generated diagram uses 1 token. If your tokens reach 0, you\'ll see a popup message letting you know your free tokens have been used. You can still manually edit diagrams in the visual editor even when tokens are depleted.',
        },
        {
          question: 'What if the AI makes a mistake or misinterprets my input?',
          answer: 'Structura includes AI error handling and smart suggestions. If something doesn\'t look right, an error message will appear with options to: Fix it automatically using AI, or manually edit nodes within the visual editor.',
        },
        {
          question: 'Is my data or diagram content stored online?',
          answer: 'Your data is processed securely within the google auth system and Structura Diagram does not store your text prompts or generated diagrams on external servers.',
        },
        {
          question: 'What makes Structura Diagram different from other tools?',
          answer: 'Unlike traditional diagram tools that require manual drawing, Structura Diagram uses a built-in AI engine to automate creation. It\'s faster, smarter, and more creative. With a sleek, Gen Z–inspired interface designed to make diagramming fun and intuitive.',
        },
        {
          question: 'Can I use Structura for academic or team projects?',
          answer: 'Absolutely! Structura is ideal for: Academic assignments (like system design or ERD tasks), software modeling and documentation, and team brainstorming and project visualization.',
        },
        {
          question: 'Will Structura Diagram get new updates or features?',
          answer: 'Yes! We\'re constantly improving Structura. Future updates will include: Diagram history & version tracking, collaborative editing, auto-layout optimization, more diagram types and export options, and enhanced AI prompt understanding.',
        },
      ],
    },
    footer: {
      tagline: 'Built for Ideas. Powered by AI.',
      quickLinks: 'Quick Links',
      connect: 'Connect',
      copyright: '© 2025 Structura Diagram. All rights reserved.',
      exampleGallery: 'Example Gallery',
    },
  },
  ID: {
  navbar: {
    home: 'Beranda',
    features: 'Fitur',
    howItWorks: 'Cara Kerja',
    documentation: 'Dokumentasi',
    login: 'Masuk',
    logout: 'Keluar',
    tryNow: 'Coba Sekarang',
    language: 'Bahasa',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
  },
  auth: {
    signInWithGoogle: 'Masuk dengan Google',
    loggingIn: 'Sedang masuk...',
    tokenWarning: 'Peringatan Token',
    outOfTokens: 'Token Habis!',
    tokensRemaining: 'token tersisa',
    tokensLabel: 'Token',
    noTokensMessage: 'Anda telah menggunakan semua token gratis Anda (0 token tersisa).',
    waitForReset: 'Anda masih dapat mengedit diagram secara manual di editor visual.',
  },
    hero: {
      badge: 'Didukung oleh AI Bawaan',
      title: 'Visualisasikan Ide Anda',
      titleHighlight: 'Secara Cerdas',
      description: 'Pembuat diagram bertenaga AI generasi berikutnya — dibuat untuk pengembang, pelajar, dan kreator. Buat flowchart, UML, ERD, dan banyak lagi dengan mudah dalam hitungan detik.',
      launchButton: 'Buka Pembuat Diagram',
      viewExamples: 'Lihat Contoh',
    },
    stats: {
      generation: {
        value: '5–10d',
        label: 'Pembuatan Diagram',
        tooltip: 'Buat diagram profesional hanya dalam 5-10 detik',
      },
      types: {
        value: '25+',
        label: 'Jenis Diagram Didukung',
        tooltip: 'UML, Flowchart, ERD, Architecture & 22 jenis diagram lainnya',
      },
      tokens: {
        value: '10',
        label: 'Penggunaan Gratis',
        tooltip: 'Buat hingga 10 diagram menggunakan AI bawaan kami',
      },
      aiHandling: {
        value: 'AI Cerdas',
        label: 'Penanganan Error AI',
        tooltip: 'Deteksi error cerdas dan perbaikan kode otomatis',
      },
    },
    features: {
      title: 'Apa yang Membuat Structura',
      titleHighlight: 'Berbeda?',
      subtitle: 'Fitur-fitur canggih dirancang untuk membuat pembuatan diagram mudah dan menyenangkan',
      multiDiagram: {
        title: 'Dukungan Multi-Diagram',
        description: 'Buat flowchart, diagram kelas, diagram sequence, dan ERD dengan mudah.',
      },
      aiEngine: {
        title: 'Mesin AI Bawaan',
        description: 'Tidak perlu API eksternal. AI kami mengubah teks Anda menjadi diagram secara instan.',
      },
      creativeInterface: {
        title: 'Antarmuka Kreatif',
        description: 'UI modern dengan desain gradien dan animasi halus untuk pengalaman yang menyenangkan.',
      },
      fastRendering: {
        title: 'Rendering Cepat & Cerdas',
        description: 'Menghasilkan kode diagram secara instan dan memvisualisasikannya secara dinamis secara real-time.',
      },
      webBased: {
        title: 'Berbasis Web & Gratis',
        description: 'Tidak perlu instalasi. Akses di mana saja, kapan saja dari perangkat apa pun.',
      },
      export: {
        title: 'Opsi Ekspor',
        description: 'Unduh diagram Anda sebagai SVG atau PNG untuk presentasi dan dokumentasi.',
      },
    },
    useCases: {
      title: 'Dibuat untuk Setiap Kreator',
      subtitle: 'Structura Diagram beradaptasi dengan alur kerja Anda — dari proyek akademis hingga sistem profesional.',
      students: {
        title: 'Pelajar & Pendidik',
        description: 'Belajar dan mengajar UML atau ERD secara visual.',
      },
      developers: {
        title: 'Pengembang & Insinyur',
        description: 'Rancang sistem lebih cepat dari sebelumnya.',
      },
      researchers: {
        title: 'Peneliti & Desainer',
        description: 'Petakan kerangka kerja dengan jelas.',
      },
      teams: {
        title: 'Tim & Proyek',
        description: 'Berkolaborasi pada ide dengan mudah.',
      },
    },
    exampleGallery: {
      title: 'Galeri Contoh',
      subtitle: 'Dapatkan inspirasi dari contoh diagram dunia nyata',
      flowchart: {
        title: 'Flowchart',
        subtitle: 'Proses Login',
        description: 'Visualisasi alur autentikasi pengguna',
      },
      classDiagram: {
        title: 'Diagram Kelas',
        subtitle: 'Sistem Perpustakaan',
        description: 'Desain sistem berorientasi objek',
      },
      sequenceDiagram: {
        title: 'Diagram Sequence',
        subtitle: 'Registrasi Pengguna',
        description: 'Pemetaan proses interaktif',
      },
      erd: {
        title: 'ERD',
        subtitle: 'Database E-commerce',
        description: 'Pemodelan relasi database',
      },
    },
    howItWorks: {
      title: 'Cara',
      titleHighlight: 'Kerja',
      subtitle: 'Empat langkah sederhana untuk membuat diagram profesional',
      describe: {
        title: 'Jelaskan Ide Anda',
        description: 'Cukup ketik diagram apa yang Anda butuhkan, seperti \'buat diagram kelas untuk sistem perpustakaan\'.',
      },
      aiInterprets: {
        title: 'AI Menginterpretasi',
        description: 'AI bawaan kami memahami input Anda dan menghasilkan kode diagram secara otomatis.',
      },
      rendering: {
        title: 'Rendering Real-time',
        description: 'Structura merender diagram Anda secara visual secara real-time dengan format yang indah.',
      },
      edit: {
        title: 'Edit & Sempurnakan',
        description: 'Sesuaikan node, edge, dan label sesuai kebutuhan. Ekspor saat Anda puas.',
      },
    },
    supportedDiagrams: {
      title: '25+ Jenis',
      titleHighlight: 'Diagram Didukung',
      subtitle: 'Dari flowchart hingga diagram arsitektur, buat visualisasi apa pun yang Anda butuhkan',
    },
    faq: {
      title: 'Pertanyaan yang Sering Diajukan',
      subtitle: 'Semua yang perlu Anda ketahui tentang Structura Diagram',
      items: [
        {
          question: 'Apa itu Structura Diagram?',
          answer: 'Structura Diagram adalah alat web bertenaga AI yang membantu Anda membuat diagram profesional seperti flowchart, UML, diagram sequence, ERD, dan 13+ jenis diagram lainnya. Semua dihasilkan secara instan dari prompt teks sederhana.',
        },
        {
          question: 'Bagaimana cara kerja AI bawaan?',
          answer: 'Mesin AI bawaan kami menginterpretasikan deskripsi teks Anda dan secara otomatis mengubahnya menjadi kode diagram visual. Tidak perlu API eksternal atau pengaturan. Cukup ketik ide Anda, dan Structura memvisualisasikannya secara real-time.',
        },
        {
          question: 'Apakah saya memerlukan pengalaman desain atau coding?',
          answer: 'Tidak sama sekali! Structura Diagram dibuat untuk semua orang, dari pelajar dan pemula hingga profesional. Jika Anda dapat menjelaskan ide Anda dengan kata-kata, Structura dapat mengubahnya menjadi diagram profesional yang jelas.',
        },
        {
          question: 'Apakah saya perlu akun untuk menggunakan Structura Diagram?',
          answer: 'Ya, Anda perlu masuk dengan akun Google Anda untuk mengakses pembuat diagram. Structura menggunakan login Google untuk akses yang aman dan lancar, tanpa perlu pendaftaran manual atau kata sandi.',
        },
        {
          question: 'Apakah Structura Diagram gratis untuk digunakan?',
          answer: 'Ya! Structura Diagram gratis digunakan dengan 10 token gratis sekali waktu untuk diagram bertenaga AI. Kami berencana untuk memperkenalkan paket premium di masa depan dengan batas lebih tinggi dan manfaat tambahan.',
        },
        {
          question: 'Bisakah saya mengekspor diagram saya?',
          answer: 'Ya. Anda dapat mengekspor diagram Anda sebagai file SVG. Sempurna untuk presentasi, laporan, dan dokumentasi.',
        },
        {
          question: 'Seberapa akurat pembuatan diagram AI?',
          answer: 'AI kami dilatih untuk menginterpretasikan hubungan struktural dan sintaks diagram dengan akurasi tinggi, memastikan hasil yang jelas dan profesional setiap saat.',
        },
        {
          question: 'Apa yang terjadi jika token saya habis?',
          answer: 'Setiap diagram bertenaga AI menggunakan 1 token. Jika token Anda mencapai 0, Anda akan melihat pesan popup yang memberi tahu bahwa token gratis Anda telah digunakan. Anda masih dapat mengedit diagram secara manual di editor visual meskipun token habis.',
        },
        {
          question: 'Bagaimana jika AI membuat kesalahan atau salah menginterpretasikan input saya?',
          answer: 'Structura mencakup penanganan error AI dan saran cerdas. Jika sesuatu tidak terlihat benar, pesan error akan muncul dengan opsi untuk: Memperbaikinya secara otomatis menggunakan AI, atau mengedit node secara manual dalam editor visual.',
        },
        {
          question: 'Apakah data atau konten diagram saya disimpan secara online?',
          answer: 'Data Anda diproses dengan aman dalam sistem autentikasi google dan Structura Diagram tidak menyimpan prompt teks atau diagram yang dihasilkan Anda di server eksternal.',
        },
        {
          question: 'Apa yang membuat Structura Diagram berbeda dari alat lain?',
          answer: 'Tidak seperti alat diagram tradisional yang memerlukan gambar manual, Structura Diagram menggunakan mesin AI bawaan untuk mengotomatisasi pembuatan. Lebih cepat, lebih cerdas, dan lebih kreatif. Dengan antarmuka bergaya Gen Z yang ramping yang dirancang untuk membuat pembuatan diagram menyenangkan dan intuitif.',
        },
        {
          question: 'Bisakah saya menggunakan Structura untuk proyek akademis atau tim?',
          answer: 'Tentu saja! Structura ideal untuk: Tugas akademis (seperti desain sistem atau tugas ERD), pemodelan dan dokumentasi perangkat lunak, dan brainstorming tim dan visualisasi proyek.',
        },
        {
          question: 'Apakah Structura Diagram akan mendapatkan pembaruan atau fitur baru?',
          answer: 'Ya! Kami terus meningkatkan Structura. Pembaruan di masa depan akan mencakup: Riwayat diagram & pelacakan versi, pengeditan kolaboratif, optimasi tata letak otomatis, lebih banyak jenis diagram dan opsi ekspor, dan pemahaman prompt AI yang ditingkatkan.',
        },
      ],
    },
    footer: {
      tagline: 'Dibuat untuk Ide. Didukung oleh AI.',
      quickLinks: 'Tautan Cepat',
      connect: 'Hubungkan',
      copyright: '© 2025 Structura Diagram. Semua hak dilindungi.',
      exampleGallery: 'Galeri Contoh',
    },
  },
};
