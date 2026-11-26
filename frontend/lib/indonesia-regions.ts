export interface IslandGroup {
  island: string;
  provinces: {
    name: string;
    kabupaten: string[];
  }[];
}

export const INDONESIA_ADMINISTRATIVE: IslandGroup[] = [
  {
    island: "Sumatera",
    provinces: [
      {
        name: "Aceh",
        kabupaten: [
          "Kab. Aceh Barat", "Kab. Aceh Barat Daya", "Kab. Aceh Besar", "Kab. Aceh Jaya",
          "Kab. Aceh Selatan", "Kab. Aceh Singkil", "Kab. Aceh Tamiang", "Kab. Aceh Tengah",
          "Kab. Aceh Tenggara", "Kab. Aceh Timur", "Kab. Aceh Utara", "Kab. Bener Meriah",
          "Kab. Bireuen", "Kab. Gayo Lues", "Kab. Nagan Raya", "Kab. Pidie", "Kab. Pidie Jaya",
          "Kab. Simeulue", "Kota Banda Aceh", "Kota Langsa", "Kota Lhokseumawe", "Kota Sabang", "Kota Subulussalam"
        ]
      },
      {
        name: "Sumatera Utara",
        kabupaten: [
          "Kab. Asahan", "Kab. Batu Bara", "Kab. Dairi", "Kab. Deli Serdang", "Kab. Humbang Hasundutan",
          "Kab. Karo", "Kab. Labuhanbatu", "Kab. Labuhanbatu Selatan", "Kab. Labuhanbatu Utara",
          "Kab. Langkat", "Kab. Mandailing Natal", "Kab. Nias", "Kab. Nias Barat", "Kab. Nias Selatan",
          "Kab. Nias Utara", "Kab. Padang Lawas", "Kab. Padang Lawas Utara", "Kab. Pakpak Bharat",
          "Kab. Samosir", "Kab. Serdang Bedagai", "Kab. Simalungun", "Kab. Tapanuli Selatan",
          "Kab. Tapanuli Tengah", "Kab. Tapanuli Utara", "Kab. Toba", "Kota Binjai", "Kota Gunungsitoli",
          "Kota Medan", "Kota Padangsidimpuan", "Kota Pematangsiantar", "Kota Sibolga", "Kota Tanjungbalai", "Kota Tebing Tinggi"
        ]
      },
      {
        name: "Sumatera Barat",
        kabupaten: [
          "Kab. Agam", "Kab. Dharmasraya", "Kab. Kepulauan Mentawai", "Kab. Lima Puluh Kota",
          "Kab. Padang Pariaman", "Kab. Pasaman", "Kab. Pasaman Barat", "Kab. Pesisir Selatan",
          "Kab. Sijunjung", "Kab. Solok", "Kab. Solok Selatan", "Kab. Tanah Datar",
          "Kota Bukittinggi", "Kota Padang", "Kota Padang Panjang", "Kota Pariaman", "Kota Payakumbuh", "Kota Sawahlunto", "Kota Solok"
        ]
      },
      {
        name: "Riau",
        kabupaten: [
          "Kab. Bengkalis", "Kab. Indragiri Hilir", "Kab. Indragiri Hulu", "Kab. Kampar",
          "Kab. Kepulauan Meranti", "Kab. Kuantan Singingi", "Kab. Pelalawan", "Kab. Rokan Hilir",
          "Kab. Rokan Hulu", "Kab. Siak", "Kota Dumai", "Kota Pekanbaru"
        ]
      },
      {
        name: "Kepulauan Riau",
        kabupaten: [
          "Kab. Bintan", "Kab. Karimun", "Kab. Kepulauan Anambas", "Kab. Lingga", "Kab. Natuna",
          "Kota Batam", "Kota Tanjungpinang"
        ]
      },
      {
        name: "Jambi",
        kabupaten: [
          "Kab. Batanghari", "Kab. Bungo", "Kab. Kerinci", "Kab. Merangin", "Kab. Muaro Jambi",
          "Kab. Sarolangun", "Kab. Tanjung Jabung Barat", "Kab. Tanjung Jabung Timur", "Kab. Tebo",
          "Kota Jambi", "Kota Sungai Penuh"
        ]
      },
      {
        name: "Sumatera Selatan",
        kabupaten: [
          "Kab. Banyuasin", "Kab. Empat Lawang", "Kab. Lahat", "Kab. Muara Enim", "Kab. Musi Banyuasin",
          "Kab. Musi Rawas", "Kab. Musi Rawas Utara", "Kab. Ogan Ilir", "Kab. Ogan Komering Ilir",
          "Kab. Ogan Komering Ulu", "Kab. Ogan Komering Ulu Selatan", "Kab. Ogan Komering Ulu Timur",
          "Kab. Penukal Abab Lematang Ilir", "Kota Lubuklinggau", "Kota Pagar Alam", "Kota Palembang", "Kota Prabumulih"
        ]
      },
      {
        name: "Kep. Bangka Belitung",
        kabupaten: [
          "Kab. Bangka", "Kab. Bangka Barat", "Kab. Bangka Selatan", "Kab. Bangka Tengah",
          "Kab. Belitung", "Kab. Belitung Timur", "Kota Pangkalpinang"
        ]
      },
      {
        name: "Bengkulu",
        kabupaten: [
          "Kab. Bengkulu Selatan", "Kab. Bengkulu Tengah", "Kab. Bengkulu Utara", "Kab. Kaur",
          "Kab. Kepahiang", "Kab. Lebong", "Kab. Mukomuko", "Kab. Rejang Lebong", "Kab. Seluma", "Kota Bengkulu"
        ]
      },
      {
        name: "Lampung",
        kabupaten: [
          "Kab. Lampung Barat", "Kab. Lampung Selatan", "Kab. Lampung Tengah", "Kab. Lampung Timur",
          "Kab. Lampung Utara", "Kab. Mesuji", "Kab. Pesawaran", "Kab. Pesisir Barat", "Kab. Pringsewu",
          "Kab. Tanggamus", "Kab. Tulang Bawang", "Kab. Tulang Bawang Barat", "Kab. Way Kanan",
          "Kota Bandar Lampung", "Kota Metro"
        ]
      }
    ]
  },
  {
    island: "Jawa",
    provinces: [
      {
        name: "DKI Jakarta",
        kabupaten: [
          "Kab. Kepulauan Seribu", "Kota Jakarta Barat", "Kota Jakarta Pusat",
          "Kota Jakarta Selatan", "Kota Jakarta Timur", "Kota Jakarta Utara"
        ]
      },
      {
        name: "Banten",
        kabupaten: [
          "Kab. Lebak", "Kab. Pandeglang", "Kab. Serang", "Kab. Tangerang",
          "Kota Cilegon", "Kota Serang", "Kota Tangerang", "Kota Tangerang Selatan"
        ]
      },
      {
        name: "Jawa Barat",
        kabupaten: [
          "Kab. Bandung", "Kab. Bandung Barat", "Kab. Bekasi", "Kab. Bogor", "Kab. Ciamis",
          "Kab. Cianjur", "Kab. Cirebon", "Kab. Garut", "Kab. Indramayu", "Kab. Karawang",
          "Kab. Kuningan", "Kab. Majalengka", "Kab. Pangandaran", "Kab. Purwakarta", "Kab. Subang",
          "Kab. Sukabumi", "Kab. Sumedang", "Kab. Tasikmalaya", "Kota Bandung", "Kota Banjar",
          "Kota Bekasi", "Kota Bogor", "Kota Cimahi", "Kota Cirebon", "Kota Depok", "Kota Sukabumi", "Kota Tasikmalaya"
        ]
      },
      {
        name: "Jawa Tengah",
        kabupaten: [
          "Kab. Banjarnegara", "Kab. Banyumas", "Kab. Batang", "Kab. Blora", "Kab. Boyolali",
          "Kab. Brebes", "Kab. Cilacap", "Kab. Demak", "Kab. Grobogan", "Kab. Jepara",
          "Kab. Karanganyar", "Kab. Kebumen", "Kab. Kendal", "Kab. Klaten", "Kab. Kudus",
          "Kab. Magelang", "Kab. Pati", "Kab. Pekalongan", "Kab. Pemalang", "Kab. Purbalingga",
          "Kab. Purworejo", "Kab. Rembang", "Kab. Semarang", "Kab. Sragen", "Kab. Sukoharjo",
          "Kab. Tegal", "Kab. Temanggung", "Kab. Wonogiri", "Kab. Wonosobo", "Kota Magelang",
          "Kota Pekalongan", "Kota Salatiga", "Kota Semarang", "Kota Surakarta", "Kota Tegal"
        ]
      },
      {
        name: "D.I. Yogyakarta",
        kabupaten: [
          "Kab. Bantul", "Kab. Gunungkidul", "Kab. Kulon Progo", "Kab. Sleman", "Kota Yogyakarta"
        ]
      },
      {
        name: "Jawa Timur",
        kabupaten: [
          "Kab. Bangkalan", "Kab. Banyuwangi", "Kab. Blitar", "Kab. Bojonegoro", "Kab. Bondowoso",
          "Kab. Gresik", "Kab. Jember", "Kab. Jombang", "Kab. Kediri", "Kab. Lamongan", "Kab. Lumajang",
          "Kab. Madiun", "Kab. Magetan", "Kab. Malang", "Kab. Mojokerto", "Kab. Nganjuk", "Kab. Ngawi",
          "Kab. Pacitan", "Kab. Pamekasan", "Kab. Pasuruan", "Kab. Ponorogo", "Kab. Probolinggo",
          "Kab. Sampang", "Kab. Sidoarjo", "Kab. Situbondo", "Kab. Sumenep", "Kab. Trenggalek",
          "Kab. Tuban", "Kab. Tulungagung", "Kota Batu", "Kota Blitar", "Kota Kediri", "Kota Madiun",
          "Kota Malang", "Kota Mojokerto", "Kota Pasuruan", "Kota Probolinggo", "Kota Surabaya"
        ]
      }
    ]
  },
  {
    island: "Bali & Nusa Tenggara",
    provinces: [
      {
        name: "Bali",
        kabupaten: [
          "Kab. Badung", "Kab. Bangli", "Kab. Buleleng", "Kab. Gianyar", "Kab. Jembrana",
          "Kab. Karangasem", "Kab. Klungkung", "Kab. Tabanan", "Kota Denpasar"
        ]
      },
      {
        name: "Nusa Tenggara Barat",
        kabupaten: [
          "Kab. Bima", "Kab. Dompu", "Kab. Lombok Barat", "Kab. Lombok Tengah", "Kab. Lombok Timur",
          "Kab. Lombok Utara", "Kab. Sumbawa", "Kab. Sumbawa Barat", "Kota Bima", "Kota Mataram"
        ]
      },
      {
        name: "Nusa Tenggara Timur",
        kabupaten: [
          "Kab. Alor", "Kab. Belu", "Kab. Ende", "Kab. Flores Timur", "Kab. Kupang", "Kab. Lembata",
          "Kab. Malaka", "Kab. Manggarai", "Kab. Manggarai Barat", "Kab. Manggarai Timur", "Kab. Nagekeo",
          "Kab. Ngada", "Kab. Rote Ndao", "Kab. Sabu Raijua", "Kab. Sikka", "Kab. Sumba Barat",
          "Kab. Sumba Barat Daya", "Kab. Sumba Tengah", "Kab. Sumba Timur", "Kab. Timor Tengah Selatan",
          "Kab. Timor Tengah Utara", "Kota Kupang"
        ]
      }
    ]
  },
  {
    island: "Kalimantan",
    provinces: [
      {
        name: "Kalimantan Barat",
        kabupaten: [
          "Kab. Bengkayang", "Kab. Kapuas Hulu", "Kab. Kayong Utara", "Kab. Ketapang", "Kab. Kubu Raya",
          "Kab. Landak", "Kab. Melawi", "Kab. Mempawah", "Kab. Sambas", "Kab. Sanggau", "Kab. Sekadau",
          "Kab. Sintang", "Kota Pontianak", "Kota Singkawang"
        ]
      },
      {
        name: "Kalimantan Tengah",
        kabupaten: [
          "Kab. Barito Selatan", "Kab. Barito Timur", "Kab. Barito Utara", "Kab. Gunung Mas", "Kab. Kapuas",
          "Kab. Katingan", "Kab. Kotawaringin Barat", "Kab. Kotawaringin Timur", "Kab. Lamandau",
          "Kab. Murung Raya", "Kab. Pulang Pisau", "Kab. Seruyan", "Kab. Sukamara", "Kota Palangka Raya"
        ]
      },
      {
        name: "Kalimantan Selatan",
        kabupaten: [
          "Kab. Balangan", "Kab. Banjar", "Kab. Barito Kuala", "Kab. Hulu Sungai Selatan",
          "Kab. Hulu Sungai Tengah", "Kab. Hulu Sungai Utara", "Kab. Kotabaru", "Kab. Tabalong",
          "Kab. Tanah Bumbu", "Kab. Tanah Laut", "Kab. Tapin", "Kota Banjarbaru", "Kota Banjarmasin"
        ]
      },
      {
        name: "Kalimantan Timur",
        kabupaten: [
          "Kab. Berau", "Kab. Kutai Barat", "Kab. Kutai Kartanegara", "Kab. Kutai Timur",
          "Kab. Mahakam Ulu", "Kab. Paser", "Kab. Penajam Paser Utara", "Kota Balikpapan",
          "Kota Bontang", "Kota Samarinda"
        ]
      },
      {
        name: "Kalimantan Utara",
        kabupaten: [
          "Kab. Bulungan", "Kab. Malinau", "Kab. Nunukan", "Kab. Tana Tidung", "Kota Tarakan"
        ]
      }
    ]
  },
  {
    island: "Sulawesi",
    provinces: [
      {
        name: "Sulawesi Utara",
        kabupaten: [
          "Kab. Bolaang Mongondow", "Kab. Bolaang Mongondow Selatan", "Kab. Bolaang Mongondow Timur",
          "Kab. Bolaang Mongondow Utara", "Kab. Kepulauan Sangihe", "Kab. Kepulauan Siau Tagulandang Biaro",
          "Kab. Kepulauan Talaud", "Kab. Minahasa", "Kab. Minahasa Selatan", "Kab. Minahasa Tenggara",
          "Kab. Minahasa Utara", "Kota Bitung", "Kota Kotamobagu", "Kota Manado", "Kota Tomohon"
        ]
      },
      {
        name: "Gorontalo",
        kabupaten: [
          "Kab. Boalemo", "Kab. Bone Bolango", "Kab. Gorontalo", "Kab. Gorontalo Utara", "Kab. Pohuwato", "Kota Gorontalo"
        ]
      },
      {
        name: "Sulawesi Tengah",
        kabupaten: [
          "Kab. Banggai", "Kab. Banggai Kepulauan", "Kab. Banggai Laut", "Kab. Buol", "Kab. Donggala",
          "Kab. Morowali", "Kab. Morowali Utara", "Kab. Parigi Moutong", "Kab. Poso", "Kab. Sigi",
          "Kab. Tojo Una-Una", "Kab. Tolitoli", "Kota Palu"
        ]
      },
      {
        name: "Sulawesi Barat",
        kabupaten: [
          "Kab. Majene", "Kab. Mamasa", "Kab. Mamuju", "Kab. Mamuju Tengah", "Kab. Pasangkayu", "Kab. Polewali Mandar"
        ]
      },
      {
        name: "Sulawesi Selatan",
        kabupaten: [
          "Kab. Bantaeng", "Kab. Barru", "Kab. Bone", "Kab. Bulukumba", "Kab. Enrekang", "Kab. Gowa",
          "Kab. Jeneponto", "Kab. Kepulauan Selayar", "Kab. Luwu", "Kab. Luwu Timur", "Kab. Luwu Utara",
          "Kab. Maros", "Kab. Pangkajene dan Kepulauan", "Kab. Pinrang", "Kab. Sidenreng Rappang",
          "Kab. Sinjai", "Kab. Soppeng", "Kab. Takalar", "Kab. Tana Toraja", "Kab. Toraja Utara",
          "Kab. Wajo", "Kota Makassar", "Kota Palopo", "Kota Parepare"
        ]
      },
      {
        name: "Sulawesi Tenggara",
        kabupaten: [
          "Kab. Bombana", "Kab. Buton", "Kab. Buton Selatan", "Kab. Buton Tengah", "Kab. Buton Utara",
          "Kab. Kolaka", "Kab. Kolaka Timur", "Kab. Kolaka Utara", "Kab. Konawe", "Kab. Konawe Kepulauan",
          "Kab. Konawe Selatan", "Kab. Konawe Utara", "Kab. Muna", "Kab. Muna Barat", "Kab. Wakatobi",
          "Kota Baubau", "Kota Kendari"
        ]
      }
    ]
  },
  {
    island: "Maluku",
    provinces: [
      {
        name: "Maluku",
        kabupaten: [
          "Kab. Buru", "Kab. Buru Selatan", "Kab. Kepulauan Aru", "Kab. Kepulauan Tanimbar",
          "Kab. Maluku Barat Daya", "Kab. Maluku Tengah", "Kab. Maluku Tenggara", "Kab. Seram Bagian Barat",
          "Kab. Seram Bagian Timur", "Kota Ambon", "Kota Tual"
        ]
      },
      {
        name: "Maluku Utara",
        kabupaten: [
          "Kab. Halmahera Barat", "Kab. Halmahera Tengah", "Kab. Halmahera Timur", "Kab. Halmahera Selatan",
          "Kab. Halmahera Utara", "Kab. Kepulauan Sula", "Kab. Pulau Morotai", "Kab. Pulau Taliabu",
          "Kota Ternate", "Kota Tidore Kepulauan"
        ]
      }
    ]
  },
  {
    island: "Papua",
    provinces: [
      {
        name: "Papua",
        kabupaten: [
          "Kab. Biak Numfor", "Kab. Jayapura", "Kab. Keerom", "Kab. Kepulauan Yapen",
          "Kab. Mamberamo Raya", "Kab. Sarmi", "Kab. Supiori", "Kab. Waropen", "Kota Jayapura"
        ]
      },
      {
        name: "Papua Barat",
        kabupaten: [
          "Kab. Fakfak", "Kab. Kaimana", "Kab. Manokwari", "Kab. Manokwari Selatan",
          "Kab. Pegunungan Arfak", "Kab. Teluk Bintuni", "Kab. Teluk Wondama"
        ]
      },
      {
        name: "Papua Selatan",
        kabupaten: [
          "Kab. Asmat", "Kab. Boven Digoel", "Kab. Mappi", "Kab. Merauke"
        ]
      },
      {
        name: "Papua Tengah",
        kabupaten: [
          "Kab. Deiyai", "Kab. Dogiyai", "Kab. Intan Jaya", "Kab. Mimika",
          "Kab. Nabire", "Kab. Paniai", "Kab. Puncak", "Kab. Puncak Jaya"
        ]
      },
      {
        name: "Papua Pegunungan",
        kabupaten: [
          "Kab. Jayawijaya", "Kab. Lanny Jaya", "Kab. Mamberamo Tengah", "Kab. Nduga",
          "Kab. Pegunungan Bintang", "Kab. Tolikara", "Kab. Yahukimo", "Kab. Yalimo"
        ]
      },
      {
        name: "Papua Barat Daya",
        kabupaten: [
          "Kab. Maybrat", "Kab. Raja Ampat", "Kab. Sorong", "Kab. Sorong Selatan",
          "Kab. Tambrauw", "Kota Sorong"
        ]
      }
    ]
  }
];

export const ALL_PROVINCES: string[] = INDONESIA_ADMINISTRATIVE.flatMap((group) =>
  group.provinces.map((p) => p.name)
);

export const PROVINCE_TO_KABUPATEN: Record<string, string[]> = INDONESIA_ADMINISTRATIVE.reduce(
  (acc, group) => {
    group.provinces.forEach((p) => {
      acc[p.name] = p.kabupaten;
    });
    return acc;
  },
  {} as Record<string, string[]>
);

export const ALL_KABUPATEN: string[] = Array.from(
  new Set(INDONESIA_ADMINISTRATIVE.flatMap((group) => group.provinces.flatMap((p) => p.kabupaten)))
).sort();

export function normalizeRegion(str: string): string {
  return str
    .toLowerCase()
    .replace(/^provinsi\s+/i, "")
    .replace(/^(kabupaten|kab\.|kota)\s+/i, "")
    .trim();
}

export function getKabupatenOptions(provinceName: string): string[] {
  if (!provinceName || provinceName === "ALL") {
    return [];
  }

  if (PROVINCE_TO_KABUPATEN[provinceName]) {
    return PROVINCE_TO_KABUPATEN[provinceName];
  }

  const normTarget = normalizeRegion(provinceName);
  for (const prov of ALL_PROVINCES) {
    const normProv = normalizeRegion(prov);
    if (normTarget.includes(normProv) || normProv.includes(normTarget)) {
      return PROVINCE_TO_KABUPATEN[prov] || [];
    }
  }

  return [];
}
