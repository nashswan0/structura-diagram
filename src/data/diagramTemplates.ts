export interface DiagramTemplate {
    id: string;
    name: string;
    description: string;
    type: 'mermaid' | 'plantuml';
    category: string;
    code: string;
  }
  
  export const diagramTemplates: DiagramTemplate[] = [
    {
      id: 'flowchart',
      name: 'Flowchart',
      description: 'Diagram alur proses bisnis',
      type: 'mermaid',
      category: 'Umum',
      code: `graph TD
      A[Mulai] --> B{Apakah sudah login?}
      B -->|Ya| C[Tampilkan Dashboard]
      B -->|Tidak| D[Halaman Login]
      D --> E[Input Username & Password]
      E --> F{Validasi Data}
      F -->|Valid| C
      F -->|Tidak Valid| G[Tampilkan Error]
      G --> E
      C --> H[Selesai]`
    },
    {
      id: 'sequence',
      name: 'Sequence Diagram',
      description: 'Diagram interaksi antar objek',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  actor Pengguna
  participant "Sistem Web" as Web
  participant "Server" as Server
  database "Database" as DB
  
  Pengguna -> Web: Buka halaman
  Web -> Server: Request data
  Server -> DB: Query data
  DB --> Server: Return data
  Server --> Web: Response data
  Web --> Pengguna: Tampilkan halaman
  @enduml`
    },
    {
      id: 'class',
      name: 'Class Diagram',
      description: 'Diagram struktur kelas sistem',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  class Pengguna {
    - id: int
    - nama: string
    - email: string
    + login()
    + logout()
  }
  
  class Produk {
    - id: int
    - nama: string
    - harga: decimal
    + tambahStok()
    + kurangiStok()
  }
  
  class Pesanan {
    - id: int
    - tanggal: date
    - total: decimal
    + hitungTotal()
    + bayar()
  }
  
  Pengguna "1" -- "0..*" Pesanan
  Pesanan "1" -- "1..*" Produk
  @enduml`
    },
    {
      id: 'erd',
      name: 'Entity Relationship Diagram',
      description: 'Diagram relasi antar entitas database',
      type: 'mermaid',
      category: 'Database',
      code: `erDiagram
      PELANGGAN ||--o{ PESANAN : membuat
      PELANGGAN {
          int id_pelanggan PK
          string nama
          string email
          string telepon
      }
      PESANAN ||--|{ DETAIL_PESANAN : berisi
      PESANAN {
          int id_pesanan PK
          int id_pelanggan FK
          date tanggal
          decimal total
      }
      PRODUK ||--o{ DETAIL_PESANAN : termasuk
      PRODUK {
          int id_produk PK
          string nama
          decimal harga
          int stok
      }
      DETAIL_PESANAN {
          int id_detail PK
          int id_pesanan FK
          int id_produk FK
          int jumlah
          decimal subtotal
      }`
    },
    {
      id: 'state',
      name: 'State Diagram',
      description: 'Diagram status dan transisi',
      type: 'mermaid',
      category: 'UML',
      code: `stateDiagram-v2
      [*] --> Menunggu
      Menunggu --> Diproses: Terima Pesanan
      Diproses --> Dikemas: Proses Selesai
      Dikemas --> Dikirim: Siap Kirim
      Dikirim --> Selesai: Barang Diterima
      Diproses --> Dibatalkan: Pembatalan
      Menunggu --> Dibatalkan: Timeout
      Selesai --> [*]
      Dibatalkan --> [*]`
    },
    {
      id: 'gantt',
      name: 'Gantt Chart',
      description: 'Diagram timeline proyek',
      type: 'mermaid',
      category: 'Manajemen',
      code: `gantt
      title Jadwal Pengembangan Aplikasi
      dateFormat YYYY-MM-DD
      section Perencanaan
      Analisis Kebutuhan    :a1, 2024-01-01, 14d
      Desain Sistem         :a2, after a1, 10d
      section Pengembangan
      Backend               :b1, after a2, 21d
      Frontend              :b2, after a2, 21d
      Integrasi             :b3, after b1, 7d
      section Testing
      Unit Testing          :c1, after b3, 7d
      Integration Testing   :c2, after c1, 5d
      UAT                   :c3, after c2, 7d
      section Deploy
      Deployment            :d1, after c3, 3d`
    },
    {
      id: 'pie',
      name: 'Pie Chart',
      description: 'Diagram lingkaran untuk data persentase',
      type: 'mermaid',
      category: 'Statistik',
      code: `pie title Distribusi Pengguna Berdasarkan Usia
      "18-25 tahun" : 35
      "26-35 tahun" : 40
      "36-45 tahun" : 15
      "46-55 tahun" : 7
      "56+ tahun" : 3`
    },
    {
      id: 'git',
      name: 'Git Graph',
      description: 'Diagram alur git branch',
      type: 'mermaid',
      category: 'Version Control',
      code: `gitGraph
      commit id: "Init project"
      commit id: "Add authentication"
      branch development
      checkout development
      commit id: "Add user module"
      commit id: "Add product module"
      checkout main
      merge development
      branch feature-payment
      checkout feature-payment
      commit id: "Add payment gateway"
      commit id: "Fix payment bug"
      checkout main
      merge feature-payment
      commit id: "Release v1.0"`
    },
    {
      id: 'usecase',
      name: 'Use Case Diagram',
      description: 'Diagram kasus penggunaan sistem',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  left to right direction
  actor Pelanggan
  actor Admin
  
  rectangle "Sistem E-Commerce" {
    Pelanggan -- (Registrasi)
    Pelanggan -- (Login)
    Pelanggan -- (Cari Produk)
    Pelanggan -- (Beli Produk)
    Pelanggan -- (Bayar)
    
    Admin -- (Kelola Produk)
    Admin -- (Kelola Pesanan)
    Admin -- (Lihat Laporan)
    
    (Beli Produk) ..> (Login) : <<include>>
    (Bayar) ..> (Beli Produk) : <<include>>
  }
  @enduml`
    },
    {
      id: 'activity',
      name: 'Activity Diagram',
      description: 'Diagram aktivitas proses',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  start
  :Pengguna membuka aplikasi;
  :Tampilkan halaman login;
  if (Sudah punya akun?) then (ya)
    :Input username dan password;
    if (Data valid?) then (ya)
      :Login berhasil;
      :Tampilkan dashboard;
    else (tidak)
      :Tampilkan error;
      stop
    endif
  else (tidak)
    :Tampilkan form registrasi;
    :Input data registrasi;
    :Simpan data pengguna;
    :Kirim email verifikasi;
  endif
  stop
  @enduml`
    },
    {
      id: 'component',
      name: 'Component Diagram',
      description: 'Diagram komponen sistem',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  package "Frontend" {
    [UI Component]
    [State Management]
    [API Client]
  }
  
  package "Backend" {
    [API Gateway]
    [Authentication]
    [Business Logic]
    [Database Access]
  }
  
  database "Database" {
    [PostgreSQL]
  }
  
  [UI Component] --> [State Management]
  [State Management] --> [API Client]
  [API Client] --> [API Gateway]
  [API Gateway] --> [Authentication]
  [API Gateway] --> [Business Logic]
  [Business Logic] --> [Database Access]
  [Database Access] --> [PostgreSQL]
  @enduml`
    },
    {
      id: 'deployment',
      name: 'Deployment Diagram',
      description: 'Diagram deployment infrastruktur',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  node "Client Browser" {
    [Web Application]
  }
  
  node "Web Server" {
    [Nginx]
    [React App]
  }
  
  node "Application Server" {
    [Node.js]
    [Express API]
  }
  
  node "Database Server" {
    database "PostgreSQL" {
      [Database]
    }
  }
  
  [Web Application] --> [Nginx] : HTTPS
  [Nginx] --> [React App]
  [React App] --> [Express API] : REST API
  [Express API] --> [Database]
  @enduml`
    },
    {
      id: 'object',
      name: 'Object Diagram',
      description: 'Diagram instance objek',
      type: 'plantuml',
      category: 'UML',
      code: `@startuml
  object Pengguna1 {
    id = 1
    nama = "Budi Santoso"
    email = "budi@email.com"
  }
  
  object Pesanan1 {
    id = 101
    tanggal = "2024-01-15"
    total = 500000
  }
  
  object Produk1 {
    id = 201
    nama = "Laptop"
    harga = 500000
  }
  
  Pengguna1 -- Pesanan1
  Pesanan1 -- Produk1
  @enduml`
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Diagram garis waktu',
      type: 'mermaid',
      category: 'Umum',
      code: `timeline
      title Sejarah Perusahaan
      2020 : Pendirian perusahaan
           : Kantor pertama dibuka
      2021 : Peluncuran produk pertama
           : 1000 pengguna pertama
      2022 : Ekspansi ke 5 kota
           : Pencapaian 10.000 pengguna
      2023 : Pendanaan Series A
           : Peluncuran aplikasi mobile
      2024 : Ekspansi internasional
           : 100.000 pengguna aktif`
    },
    {
      id: 'mindmap',
      name: 'Mind Map',
      description: 'Diagram peta pikiran',
      type: 'mermaid',
      category: 'Brainstorming',
      code: `mindmap
    root((Aplikasi E-Commerce))
      Fitur Utama
        Katalog Produk
          Pencarian
          Filter
          Kategori
        Keranjang Belanja
          Tambah Produk
          Hapus Produk
          Update Jumlah
        Pembayaran
          Transfer Bank
          E-Wallet
          Kartu Kredit
      Manajemen
        Dashboard Admin
          Statistik Penjualan
          Laporan
        Kelola Produk
          Tambah
          Edit
          Hapus
        Kelola Pesanan
          Status Pesanan
          Tracking
      Pengguna
        Registrasi
        Login
        Profile
        Riwayat Pesanan`
    },
    {
      id: 'quadrant',
      name: 'Quadrant Chart',
      description: 'Diagram kuadran prioritas',
      type: 'mermaid',
      category: 'Manajemen',
      code: `quadrantChart
      title Prioritas Fitur Aplikasi
      x-axis Rendah Urgensi --> Tinggi Urgensi
      y-axis Rendah Kompleksitas --> Tinggi Kompleksitas
      quadrant-1 Lakukan Nanti
      quadrant-2 Prioritas Utama
      quadrant-3 Bisa Diabaikan
      quadrant-4 Lakukan Cepat
      Notifikasi: [0.7, 0.3]
      Chat Support: [0.8, 0.7]
      Export PDF: [0.4, 0.2]
      Dashboard: [0.9, 0.8]
      Dark Mode: [0.3, 0.1]
      Multi Bahasa: [0.5, 0.5]
      Analytics: [0.8, 0.6]`
    },
    {
      id: 'requirement',
      name: 'Requirement Diagram',
      description: 'Diagram kebutuhan sistem',
      type: 'mermaid',
      category: 'UML',
      code: `requirementDiagram
  
      requirement sistem_e_commerce {
          id: 1
          text: Sistem harus mendukung transaksi online
          risk: high
          verifymethod: test
      }
  
      requirement keamanan_data {
          id: 2
          text: Data pengguna harus terenkripsi
          risk: high
          verifymethod: inspection
      }
  
      requirement performa {
          id: 3
          text: Waktu loading maksimal 2 detik
          risk: medium
          verifymethod: test
      }
  
      requirement multi_payment {
          id: 4
          text: Mendukung berbagai metode pembayaran
          risk: medium
          verifymethod: demonstration
      }
  
      sistem_e_commerce - contains -> keamanan_data
      sistem_e_commerce - contains -> performa
      sistem_e_commerce - contains -> multi_payment`
    },
    {
      id: 'journey',
      name: 'User Journey',
      description: 'Diagram perjalanan pengguna',
      type: 'mermaid',
      category: 'UX',
      code: `journey
      title Perjalanan Pengguna Membeli Produk
      section Penemuan
        Melihat iklan: 5: Pengguna
        Mengunjungi website: 4: Pengguna
        Mencari produk: 3: Pengguna
      section Evaluasi
        Membaca deskripsi: 4: Pengguna
        Melihat review: 5: Pengguna
        Membandingkan harga: 3: Pengguna
      section Pembelian
        Menambah ke keranjang: 5: Pengguna
        Mengisi data pengiriman: 3: Pengguna
        Memilih pembayaran: 4: Pengguna
        Konfirmasi pesanan: 5: Pengguna
      section Pasca Pembelian
        Menerima notifikasi: 5: Pengguna
        Tracking pengiriman: 4: Pengguna
        Menerima produk: 5: Pengguna
        Memberikan review: 4: Pengguna`
    },
    {
      id: 'c4-context',
      name: 'C4 Context Diagram',
      description: 'Diagram konteks sistem (C4 Model)',
      type: 'mermaid',
      category: 'Arsitektur',
      code: `C4Context
      title Diagram Konteks Sistem E-Commerce
  
      Person(pelanggan, "Pelanggan", "Pengguna yang membeli produk")
      Person(admin, "Admin", "Mengelola sistem dan produk")
  
      System(ecommerce, "Sistem E-Commerce", "Platform jual beli online")
  
      System_Ext(payment, "Payment Gateway", "Memproses pembayaran")
      System_Ext(shipping, "Shipping Service", "Layanan pengiriman")
      System_Ext(email, "Email Service", "Mengirim email notifikasi")
  
      Rel(pelanggan, ecommerce, "Membeli produk")
      Rel(admin, ecommerce, "Mengelola sistem")
      Rel(ecommerce, payment, "Proses pembayaran")
      Rel(ecommerce, shipping, "Lacak pengiriman")
      Rel(ecommerce, email, "Kirim notifikasi")`
    },
    {
      id: 'sankey',
      name: 'Sankey Diagram',
      description: 'Diagram aliran data atau energi',
      type: 'mermaid',
      category: 'Statistik',
      code: `sankey-beta
  
  Pengunjung Website,Homepage,5000
  Pengunjung Website,Kategori Produk,3000
  Homepage,Detail Produk,2000
  Kategori Produk,Detail Produk,2500
  Detail Produk,Keranjang,1800
  Detail Produk,Keluar,2700
  Keranjang,Checkout,1200
  Keranjang,Keluar,600
  Checkout,Pembayaran,1000
  Checkout,Keluar,200
  Pembayaran,Selesai,900
  Pembayaran,Gagal,100`
    },
    {
      id: 'packet',
      name: 'Packet Diagram',
      description: 'Diagram struktur paket/modul',
      type: 'mermaid',
      category: 'Arsitektur',
      code: `packet-beta
      0-15: "Header"
      16-31: "Source Port"
      32-47: "Destination Port"
      48-63: "Sequence Number"
      64-79: "Acknowledgment"
      80-95: "Data Offset|Reserved|Flags"
      96-111: "Window Size"
      112-127: "Checksum|Urgent Pointer"
      128-255: "Options & Padding"`
    },
    {
      id: 'block',
      name: 'Block Diagram',
      description: 'Diagram blok sistem',
      type: 'mermaid',
      category: 'Arsitektur',
      code: `block-beta
  columns 3
    Frontend:3
    block:group1:3
      API["API Gateway"]
      Auth["Authentication"]
      Business["Business Logic"]
    end
    block:group2:3
      Database["Database"]
      Cache["Redis Cache"]
      Storage["File Storage"]
    end
    
    Frontend --> API
    API --> Auth
    API --> Business
    Business --> Database
    Business --> Cache
    Business --> Storage`
    },
    {
      id: 'architecture',
      name: 'Architecture Diagram',
      description: 'Diagram arsitektur aplikasi',
      type: 'mermaid',
      category: 'Arsitektur',
      code: `graph TB
      subgraph "Client Layer"
          A[Web Browser]
          B[Mobile App]
      end
      
      subgraph "Presentation Layer"
          C[Load Balancer]
          D[Web Server 1]
          E[Web Server 2]
      end
      
      subgraph "Application Layer"
          F[API Gateway]
          G[Auth Service]
          H[Product Service]
          I[Order Service]
      end
      
      subgraph "Data Layer"
          J[(Main Database)]
          K[(Cache)]
          L[(File Storage)]
      end
      
      A --> C
      B --> C
      C --> D
      C --> E
      D --> F
      E --> F
      F --> G
      F --> H
      F --> I
      G --> J
      H --> J
      I --> J
      H --> K
      I --> L`
    },
    {
      id: 'network',
      name: 'Network Diagram',
      description: 'Diagram topologi jaringan',
      type: 'mermaid',
      category: 'Infrastruktur',
      code: `graph TB
      subgraph "Internet"
          Internet[Internet]
      end
      
      subgraph "DMZ"
          FW1[Firewall]
          LB[Load Balancer]
          Web1[Web Server 1]
          Web2[Web Server 2]
      end
      
      subgraph "Internal Network"
          FW2[Internal Firewall]
          App1[App Server 1]
          App2[App Server 2]
          DB[(Database Cluster)]
      end
      
      subgraph "Management"
          Monitor[Monitoring]
          Backup[Backup Server]
      end
      
      Internet --> FW1
      FW1 --> LB
      LB --> Web1
      LB --> Web2
      Web1 --> FW2
      Web2 --> FW2
      FW2 --> App1
      FW2 --> App2
      App1 --> DB
      App2 --> DB
      Monitor -.-> Web1
      Monitor -.-> App1
      Backup -.-> DB`
    },
    {
      id: 'database-schema',
      name: 'Database Schema',
      description: 'Diagram skema database detail',
      type: 'mermaid',
      category: 'Database',
      code: `erDiagram
      USERS ||--o{ ORDERS : places
      USERS ||--o{ REVIEWS : writes
      USERS {
          int user_id PK
          varchar username UK
          varchar email UK
          varchar password_hash
          timestamp created_at
          timestamp updated_at
          boolean is_active
      }
      
      PRODUCTS ||--o{ ORDER_ITEMS : contains
      PRODUCTS ||--o{ REVIEWS : receives
      PRODUCTS ||--o{ CATEGORIES : belongs_to
      PRODUCTS {
          int product_id PK
          varchar name
          text description
          decimal price
          int stock
          int category_id FK
          timestamp created_at
      }
      
      ORDERS ||--|{ ORDER_ITEMS : includes
      ORDERS {
          int order_id PK
          int user_id FK
          decimal total_amount
          varchar status
          timestamp order_date
          varchar shipping_address
      }
      
      ORDER_ITEMS {
          int item_id PK
          int order_id FK
          int product_id FK
          int quantity
          decimal price
      }
      
      CATEGORIES {
          int category_id PK
          varchar name
          text description
      }
      
      REVIEWS {
          int review_id PK
          int user_id FK
          int product_id FK
          int rating
          text comment
          timestamp created_at
      }`
    }
  ];
  
  export const templateCategories = [
    'Semua',
    'Umum',
    'UML',
    'Database',
    'Manajemen',
    'Statistik',
    'Version Control',
    'Brainstorming',
    'UX',
    'Arsitektur',
    'Infrastruktur'
  ];
  