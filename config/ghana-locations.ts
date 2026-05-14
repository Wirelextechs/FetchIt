// Ghana Regions → Towns/Cities → Local Areas
// Especially detailed for Bono, Bono East, Ashanti (FetchIt's primary zones)

export interface GhanaLocations {
  [region: string]: {
    [town: string]: string[];
  };
}

export const GHANA_LOCATIONS: GhanaLocations = {
  "Bono East": {
    "Techiman": [
      "Central Market", "Akomadan Junction", "Ambulance", "Antoa Road", 
      "Bono Road", "Buoho", "Cheneteso", "Clock Tower Area", "Commercial Area",
      "Dromankese", "Estate Road", "Kenten", "Kyekyewere", "Mamprusi Lane",
      "Nkoranza Junction", "North Industrial Area", "Old Town", "Patriensa",
      "Piase", "Sampa Road", "Sankore Junction", "STC Yard", "Tanoso",
      "Techiman South", "Techiman North", "Techimantia", "Tromankese",
      "Tuobodom Road", "Twenedease", "Wenchi Road", "Wesley College Area"
    ],
    "Nkoranza": [
      "Bantama", "Central Market", "Dawadawa", "Fiema Road",
      "Hospital Area", "Kintampo Road", "Kyeremfem", "New Town",
      "Old Town", "Tanoso", "Yeji Road"
    ],
    "Kintampo": [
      "Atta Mensah", "Babator", "Banda Junction", "Brong Ahafo Road",
      "Central Market", "Energy Commission Road", "Kintampo Falls Area",
      "Longoro", "New Longoro", "Old Town", "Tamale Road"
    ],
    "Atebubu": [
      "Central Market", "Kwame Danso Road", "New Town",
      "Old Atebubu", "STC Yard", "Techiman Road"
    ],
    "Pru": ["Yeji", "Prang", "Abease"],
    "Sene": ["Kwame Danso", "Kajaji"],
  },

  "Bono": {
    "Sunyani": [
      "Abesim", "Ahinsan Estate", "Airport Area", "Amangoase",
      "Asufufuo", "Atronie", "Beatrice School Area", "Commercial Area",
      "Dawadawa", "Dumasua", "Fiapre", "Fiapre Junction", "Kodie",
      "Kenyasi Road", "Magazine", "New Dormaa Road", "New Site",
      "Nsuatre Road", "Old Dormaa Road", "Penkwase", "Sunyani Central",
      "Sunyani East", "Sunyani West", "Technical School Area",
      "Timber Market Area", "UCC Campus Area", "Valley View Area"
    ],
    "Berekum": [
      "Aboabo", "Asufufuo", "Central Market", "Dormaa Road",
      "Jinijini", "Kotaakyi", "Nakwabi", "New Town", "Nsawkaw Road"
    ],
    "Dormaa Ahenkro": [
      "Agyanka", "Asempaneye", "Asufufuo", "Central Market",
      "Hwere", "Nkrankwanta", "Nsawkaw", "Sehwi Road", "Wamfie Road"
    ],
    "Wenchi": [
      "Agrimanso", "Central Market", "Hospital Area", "Nsawkaw Road",
      "Old Town", "Sampa Road", "Techiman Road"
    ],
    "Jaman South": ["Drobo", "Sankore"],
    "Jaman North": ["Sampa", "Suma Ahenkro"],
    "Tain": ["Nsawkaw", "Badu", "Seikwa"],
  },

  "Ashanti": {
    "Kumasi": [
      "Aboabo", "Adum", "Ahensan Estate", "Ahwiaa", "Airport Residential",
      "Asafo", "Asawase", "Asokwa", "Bantama", "Bomso", "Buokrom",
      "Deduako", "Dichemso", "Danyame", "Ejisu Road", "Fante New Town",
      "Harper Road Area", "Hyde Park", "Kejetia", "Kenyase", "Krofrom",
      "Kwame Nkrumah Circle", "Manhyia", "Moshie Zongo", "New Tafo",
      "Nhyiaeso", "KNUST Campus", "Old Tafo", "Oforikrom", "Patasi",
      "Roman Hill", "Santasi", "Sepe Tinpom", "Sepetimpon", "Sofoline",
      "Suame", "Subin", "Takoradi Road", "Tech Junction", "Fettehman"
    ],
    "Obuasi": [
      "Ahansonyameye", "Brahabebome", "Central", "Doctorom",
      "Link Road", "Pompora", "Sanso"
    ],
    "Ejisu": ["Besease", "Bonwire", "Ejisu Central", "Juaben Road"],
    "Konongo": ["Central Market", "Oda Road", "Old Town", "Kumasi Road"],
    "Mampong": ["Central", "Hospital Area", "Kumasi Road"],
    "Asante Mampong": ["Domeabra", "New Mampong", "Old Mampong"],
    "Bekwai": ["Central", "Fomena Road", "Kumasi Road"],
    "Nkawie": ["Toase", "Afrancho", "Nkawie Town"],
    "Offinso": ["Afrancho Road", "Central Market", "Kumasi Road"],
  },

  "Greater Accra": {
    "Accra Central": [
      "Adabraka", "Adenta", "Akweteman", "Asylum Down", "Cantonments",
      "Chorkor", "Circle", "Darkuman", "Dansoman", "Dzorwulu", "East Legon",
      "Haatso", "James Town", "Kaneshie", "Kissieman", "Kokomlemle",
      "Korle Bu", "Kwame Nkrumah Avenue", "La", "Labadi", "Labone",
      "Lartebiokorshie", "Mamprobi", "Nima", "North Labone", "Okaishie",
      "Okponglo", "Osu", "Pig Farm Junction", "Ridge", "Roman Ridge",
      "Sukura", "Tesano", "Teshie", "Tudu", "Ussher Town"
    ],
    "Tema": [
      "Community 1", "Community 2", "Community 3", "Community 4",
      "Community 5", "Community 6", "Community 7", "Community 8",
      "Community 9", "Community 10", "Community 11", "Community 12",
      "Tema Manhean", "Ashaiman", "Adjei Kojo"
    ],
    "Kasoa": [
      "Buduburam", "Galilea", "New Kasoa", "Nyanyano", "Ofaakor",
      "Old Kasoa", "Pomadze", "Tuba"
    ],
    "Madina": ["Abokobi", "Adentan", "Dome", "Kwabenya", "Taifa"],
    "Achimota": ["Achimota School Area", "Mile 7", "Ofankor"],
    "Legon": ["Atomic Junction", "East Legon Hills", "Legon Campus", "NLASIA"],
    "Spintex": ["Baatsona", "Manet", "Spintex Road", "Tse Addo"],
  },

  "Eastern": {
    "Koforidua": [
      "Accra Road", "Asokore", "Atibie", "Bronyibima", "Central Market",
      "Effiduase", "Koforidua Central", "New Juaben South", "Old Estate",
      "Oyoko", "Roman Catholic Junction", "Suhum Road"
    ],
    "Nsawam": ["Adoagyiri", "Central Market", "Kumasi Road"],
    "Suhum": ["Central", "Coaltar Road", "Kumasi Road"],
    "Nkawkaw": ["Central", "Kwahu Road", "Old Town"],
    "Mpraeso": ["Kwahu Mpraeso", "Old Town", "Ridge"],
    "Akim Oda": ["Central", "Kumasi Road", "Swedru Road"],
    "Akim Tafo": ["Central", "Oda Road"],
    "Akosombo": ["Dam Area", "Ferry Terminal", "Staff Quarters"],
  },

  "Central": {
    "Cape Coast": [
      "Abura", "Ankamfoa", "Apewosika", "Assin Fosu Road", "Bakaano",
      "Benso", "Cape Coast Central", "Chapel Square", "Eguafo",
      "Ola", "Pedu", "Phantsesaw", "Takoradi Road", "UCC Campus"
    ],
    "Winneba": ["Apam Road", "Central Market", "Gyahadze", "Hospital Area"],
    "Kasoa": ["Awutu", "Bawjiase", "Gomoa Fetteh", "Ofaakor"],
    "Mankessim": ["Central Market", "Komenda Road", "Saltpond Road"],
    "Saltpond": ["Central", "Hospital Area", "Mankessim Road"],
    "Assin Fosu": ["Central Market", "Cape Coast Road", "Kumasi Road"],
  },

  "Western": {
    "Takoradi": [
      "Aboadze", "Airport", "Anaji", "Axim Road", "Effia",
      "Fijai", "Kojokrom", "Kwesimintsim", "Market Circle",
      "New Takoradi", "Nkroful", "Sekondi", "Tanokrom", "WJ"
    ],
    "Tarkwa": ["Central", "Hospital Area", "Kumasi Road", "Prestea Road"],
    "Axim": ["Central Market", "Eikwe", "Takoradi Road"],
    "Half Assini": ["Central", "Elubo Road"],
    "Sefwi Wiawso": ["Central", "Kumasi Road"],
    "Enchi": ["Central", "Kumasi Road", "Sampa Road"],
  },

  "Western North": {
    "Sefwi Wiawso": ["Central Market", "Kumasi Road"],
    "Bibiani": ["Central", "Gold Fields Area", "Kumasi Road"],
    "Sefwi Bekwai": ["Central", "Wiawso Road"],
    "Juaboso": ["Central", "Enchi Road"],
  },

  "Northern": {
    "Tamale": [
      "Aboabo", "Agric", "Bagabaga", "Choggu", "Dakpema",
      "Dungu", "Hospital Area", "Kalpohin", "Lamashegu",
      "Nyohini", "Savelugu Road", "Sagnerigu", "Shishegu",
      "Tamale Central", "Tamale South", "Vittin", "Zagyuri"
    ],
    "Yendi": ["Central", "Tamale Road"],
    "Savelugu": ["Central", "Tamale Road"],
    "Bimbilla": ["Central", "Yendi Road"],
  },

  "Upper East": {
    "Bolgatanga": [
      "Bolga Central", "Bongo Road", "Hospital Area", "Kumasi Road",
      "Navorongo Road", "SSNIT Flats", "Zuarungu"
    ],
    "Bawku": ["Central", "Bolga Road", "Zebilla Road"],
    "Navrongo": ["Central", "Bolga Road", "Paga Road"],
    "Zebilla": ["Central", "Bawku Road"],
  },

  "Upper West": {
    "Wa": [
      "Danko", "Dobile", "Nakori", "Sing", "Wa Central",
      "Wa East", "Wa West", "Yarsi"
    ],
    "Lawra": ["Central", "Nandom Road", "Wa Road"],
    "Tumu": ["Central", "Wa Road"],
  },

  "Volta": {
    "Ho": [
      "Bankoe", "Fiave", "Ho Central", "Ho Polytechnic Area",
      "Kpehe", "Lokoe", "Mawuli", "Some"
    ],
    "Hohoe": ["Central Market", "Golokwati Road", "Hospital Area"],
    "Keta": ["Central", "Denu Road", "Anyako"],
    "Aflao": ["Central", "Ghana-Togo Border"],
  },

  "Oti": {
    "Dambai": ["Central", "Jasikan Road", "Yeji Road"],
    "Jasikan": ["Central", "Hohoe Road"],
    "Nkwanta": ["Central", "Tamale Road"],
  },

  "Savannah": {
    "Damongo": ["Central", "Tamale Road"],
    "Bole": ["Central", "Tamale Road"],
    "Salaga": ["Central", "Tamale Road"],
  },

  "North East": {
    "Nalerigu": ["Central", "Gambaga Road"],
    "Gambaga": ["Central", "Nalerigu Road"],
    "Walewale": ["Central", "Tamale Road"],
  },

  "Ahafo": {
    "Goaso": ["Central Market", "Kumasi Road", "Sunyani Road"],
    "Kukuom": ["Central", "Goaso Road"],
    "Bechem": ["Central", "Kumasi Road"],
    "Duayaw Nkwanta": ["Central", "Kumasi Road"],
  },
};

export const GHANA_REGIONS = Object.keys(GHANA_LOCATIONS).sort();

export function getTowns(region: string): string[] {
  return Object.keys(GHANA_LOCATIONS[region] || {}).sort();
}

export function getLocalAreas(region: string, town: string): string[] {
  return (GHANA_LOCATIONS[region]?.[town] || []).sort();
}
