// src/utils/indiaLocations.js

// Shared India location data.
//
// Product delivery locations are stored as:
// {
//   state: "Andhra Pradesh",
//   district: "NTR",
//   city: "Vijayawada"
// }
//
// "Anywhere" can be used by the UI as a wildcard.

export const INDIA_LOCATION_DATA = {
    "Andaman and Nicobar Islands": {
        "Nicobar": [
            "Car Nicobar",
            "Campbell Bay",
            "Great Nicobar",
            "Nancowry"
        ],
        "North and Middle Andaman": [
            "Mayabunder",
            "Diglipur",
            "Rangat",
            "Baratang"
        ],
        "South Andaman": [
            "Port Blair",
            "Ferrargunj",
            "Wandoor",
            "Garacharma"
        ]
    },

    "Andhra Pradesh": {
        "Alluri Sitharama Raju": [
            "Paderu",
            "Araku Valley",
            "Chintapalle",
            "Rampachodavaram"
        ],
        "Anakapalli": [
            "Anakapalle",
            "Narsipatnam",
            "Yelamanchili",
            "Chodavaram"
        ],
        "Anantapur": [
            "Anantapur",
            "Guntakal",
            "Dharmavaram",
            "Hindupur",
            "Kadiri"
        ],
        "Annamayya": [
            "Rayachoti",
            "Madanapalle",
            "Rajampet"
        ],
        "Bapatla": [
            "Bapatla",
            "Chirala",
            "Repalle"
        ],
        "Chittoor": [
            "Chittoor",
            "Palamaner",
            "Punganur",
            "Nagari"
        ],
        "Dr. B. R. Ambedkar Konaseema": [
            "Amalapuram",
            "Razole",
            "Kothapeta",
            "Mummidivaram"
        ],
        "East Godavari": [
            "Rajamahendravaram",
            "Kakinada",
            "Peddapuram",
            "Pithapuram"
        ],
        "Eluru": [
            "Eluru",
            "Jangareddygudem",
            "Nuzvid",
            "Chintalapudi"
        ],
        "Guntur": [
            "Guntur",
            "Tenali",
            "Narasaraopet",
            "Mangalagiri"
        ],
        "Kakinada": [
            "Kakinada",
            "Peddapuram",
            "Tuni",
            "Pithapuram"
        ],
        "Krishna": [
            "Machilipatnam",
            "Gudivada",
            "Vuyyuru",
            "Pedana"
        ],
        "Kurnool": [
            "Kurnool",
            "Adoni",
            "Nandyal",
            "Dhone"
        ],
        "Nandyal": [
            "Nandyal",
            "Atmakur",
            "Banaganapalle",
            "Dhone"
        ],
        "NTR": [
            "Vijayawada",
            "Nandigama",
            "Jaggayyapeta",
            "Tiruvuru"
        ],
        "Palnadu": [
            "Narasaraopet",
            "Sattenapalle",
            "Vinukonda",
            "Piduguralla"
        ],
        "Parvathipuram Manyam": [
            "Parvathipuram",
            "Salur",
            "Kurupam"
        ],
        "Prakasam": [
            "Ongole",
            "Kandukur",
            "Markapur",
            "Chirala"
        ],
        "Sri Potti Sriramulu Nellore": [
            "Nellore",
            "Kavali",
            "Gudur",
            "Atmakur"
        ],
        "Sri Sathya Sai": [
            "Puttaparthi",
            "Kadiri",
            "Dharmavaram",
            "Penukonda"
        ],
        "Srikakulam": [
            "Srikakulam",
            "Palasa",
            "Amadalavalasa",
            "Tekkali"
        ],
        "Tirupati": [
            "Tirupati",
            "Srikalahasti",
            "Gudur",
            "Sullurpeta"
        ],
        "Visakhapatnam": [
            "Visakhapatnam",
            "Bheemunipatnam",
            "Gajuwaka"
        ],
        "Vizianagaram": [
            "Vizianagaram",
            "Bobbili",
            "Gajapathinagaram"
        ],
        "West Godavari": [
            "Bhimavaram",
            "Tadepalligudem",
            "Tanuku",
            "Narasapur"
        ],
        "YSR Kadapa": [
            "Kadapa",
            "Proddatur",
            "Rajampet",
            "Pulivendula"
        ]
    },

    "Arunachal Pradesh": {
        "Tawang": ["Tawang"],
        "West Kameng": ["Bomdila", "Dirang"],
        "East Kameng": ["Seppa"],
        "Papum Pare": ["Itanagar", "Naharlagun", "Doimukh"],
        "Lower Subansiri": ["Ziro", "Hapoli"],
        "Upper Subansiri": ["Daporijo"],
        "West Siang": ["Aalo"],
        "East Siang": ["Pasighat"],
        "Changlang": ["Changlang", "Miao"],
        "Tirap": ["Khonsa"],
        "Lohit": ["Tezu"],
        "Namsai": ["Namsai"],
        "Dibang Valley": ["Anini"],
        "Lower Dibang Valley": ["Roing"],
        "Kurung Kumey": ["Koloriang"],
        "Kra Daadi": ["Palin"],
        "Siang": ["Boleng"],
        "Upper Siang": ["Yingkiong"],
        "Longding": ["Longding"],
        "Kamle": ["Raga"],
        "Shi Yomi": ["Tato"],
        "Pakke Kessang": ["Lemmi"],
        "Lepa Rada": ["Basar"],
        "Itanagar Capital Complex": ["Itanagar"]
    },

    "Assam": {
        "Baksa": ["Mushalpur"],
        "Barpeta": ["Barpeta", "Howly", "Pathsala"],
        "Biswanath": ["Biswanath Chariali", "Gohpur"],
        "Bongaigaon": ["Bongaigaon", "Abhayapuri"],
        "Cachar": ["Silchar", "Lakhipur"],
        "Charaideo": ["Sonari"],
        "Darrang": ["Mangaldai"],
        "Dhemaji": ["Dhemaji", "Jonai"],
        "Dhubri": ["Dhubri", "Bilasipara", "Golakganj"],
        "Dibrugarh": ["Dibrugarh", "Naharkatia", "Chabua"],
        "Dima Hasao": ["Haflong"],
        "Goalpara": ["Goalpara", "Lakhipur"],
        "Golaghat": ["Golaghat", "Bokakhat", "Dergaon"],
        "Hailakandi": ["Hailakandi", "Lala"],
        "Hojai": ["Hojai", "Doboka"],
        "Jorhat": ["Jorhat", "Titabor", "Mariani"],
        "Kamrup": ["Rangia", "Palasbari", "Boko"],
        "Kamrup Metropolitan": ["Guwahati", "Dispur"],
        "Karbi Anglong": ["Diphu", "Bokajan"],
        "Karimganj": ["Karimganj", "Badarpur"],
        "Kokrajhar": ["Kokrajhar", "Gossaigaon"],
        "Lakhimpur": ["North Lakhimpur", "Bihpuria"],
        "Majuli": ["Garamur"],
        "Morigaon": ["Morigaon"],
        "Nagaon": ["Nagaon", "Hojai"],
        "Nalbari": ["Nalbari"],
        "Sivasagar": ["Sivasagar", "Nazira"],
        "Sonitpur": ["Tezpur", "Dhekiajuli"],
        "Tinsukia": ["Tinsukia", "Doomdooma"],
        "Udalguri": ["Udalguri"]
    },

    "Bihar": {
        "Araria": ["Araria", "Forbesganj"],
        "Arwal": ["Arwal"],
        "Aurangabad": ["Aurangabad", "Daudnagar"],
        "Banka": ["Banka", "Amarpur"],
        "Begusarai": ["Begusarai", "Barauni", "Teghra"],
        "Bhagalpur": ["Bhagalpur", "Kahalgaon", "Naugachia"],
        "Bhojpur": ["Ara", "Jagdishpur"],
        "Buxar": ["Buxar", "Dumraon"],
        "Darbhanga": ["Darbhanga", "Benipur"],
        "East Champaran": ["Motihari", "Raxaul"],
        "Gaya": ["Gaya", "Bodh Gaya", "Tekari"],
        "Gopalganj": ["Gopalganj"],
        "Jamui": ["Jamui"],
        "Jehanabad": ["Jehanabad"],
        "Kaimur": ["Bhabua", "Mohania"],
        "Katihar": ["Katihar", "Barsoi"],
        "Khagaria": ["Khagaria"],
        "Kishanganj": ["Kishanganj"],
        "Lakhisarai": ["Lakhisarai"],
        "Madhepura": ["Madhepura"],
        "Madhubani": ["Madhubani", "Jhanjharpur"],
        "Munger": ["Munger", "Jamalpur"],
        "Muzaffarpur": ["Muzaffarpur", "Kanti"],
        "Nalanda": ["Bihar Sharif", "Rajgir"],
        "Nawada": ["Nawada", "Rajauli"],
        "Patna": ["Patna", "Danapur", "Barh", "Phulwari Sharif"],
        "Purnia": ["Purnia", "Banmankhi"],
        "Rohtas": ["Sasaram", "Dehri"],
        "Saharsa": ["Saharsa", "Simri Bakhtiarpur"],
        "Samastipur": ["Samastipur", "Dalsinghsarai"],
        "Saran": ["Chhapra", "Sonpur"],
        "Sheikhpura": ["Sheikhpura"],
        "Sheohar": ["Sheohar"],
        "Sitamarhi": ["Sitamarhi"],
        "Siwan": ["Siwan", "Maharajganj"],
        "Supaul": ["Supaul", "Birpur"],
        "Vaishali": ["Hajipur", "Mahnar"],
        "West Champaran": ["Bettiah", "Bagaha"]
    },

    "Chhattisgarh": {
        "Balod": ["Balod", "Dondi"],
        "Baloda Bazar": ["Baloda Bazar", "Bhatapara"],
        "Balrampur-Ramanujganj": ["Balrampur", "Ramanujganj"],
        "Bastar": ["Jagdalpur", "Bastar"],
        "Bemetara": ["Bemetara"],
        "Bijapur": ["Bijapur"],
        "Bilaspur": ["Bilaspur", "Takhatpur"],
        "Dantewada": ["Dantewada", "Kirandul"],
        "Dhamtari": ["Dhamtari", "Kurud"],
        "Durg": ["Durg", "Bhilai", "Bhilai Nagar"],
        "Gariaband": ["Gariaband", "Rajim"],
        "Gaurela-Pendra-Marwahi": ["Gaurela", "Pendra"],
        "Janjgir-Champa": ["Janjgir", "Champa"],
        "Jashpur": ["Jashpur Nagar"],
        "Kanker": ["Kanker", "Charama"],
        "Kawardha": ["Kawardha"],
        "Kondagaon": ["Kondagaon"],
        "Korba": ["Korba", "Katghora"],
        "Koriya": ["Baikunthpur", "Manendragarh"],
        "Mahasamund": ["Mahasamund", "Saraipali"],
        "Mungeli": ["Mungeli"],
        "Narayanpur": ["Narayanpur"],
        "Raigarh": ["Raigarh", "Sarangarh"],
        "Raipur": ["Raipur", "Abhanpur", "Arang"],
        "Rajnandgaon": ["Rajnandgaon", "Dongargarh"],
        "Sukma": ["Sukma"],
        "Surajpur": ["Surajpur", "Pratappur"],
        "Surguja": ["Ambikapur", "Sitapur"]
    },

    "Goa": {
        "North Goa": [
            "Panaji",
            "Mapusa",
            "Bicholim",
            "Pernem"
        ],
        "South Goa": [
            "Margao",
            "Vasco da Gama",
            "Ponda",
            "Quepem"
        ]
    },

    "Gujarat": {
        "Ahmedabad": ["Ahmedabad", "Dholka", "Sanand"],
        "Amreli": ["Amreli", "Savarkundla"],
        "Anand": ["Anand", "Petlad", "Khambhat"],
        "Aravalli": ["Modasa", "Bayad"],
        "Banaskantha": ["Palanpur", "Deesa"],
        "Bharuch": ["Bharuch", "Ankleshwar"],
        "Bhavnagar": ["Bhavnagar", "Palitana"],
        "Botad": ["Botad"],
        "Chhota Udaipur": ["Chhota Udaipur", "Bodeli"],
        "Dahod": ["Dahod", "Jhalod"],
        "Dang": ["Ahwa"],
        "Devbhoomi Dwarka": ["Khambhalia", "Dwarka"],
        "Gandhinagar": ["Gandhinagar", "Kalol"],
        "Gir Somnath": ["Veraval", "Una"],
        "Jamnagar": ["Jamnagar", "Dhrol"],
        "Junagadh": ["Junagadh", "Veraval"],
        "Kheda": ["Nadiad", "Kapadvanj"],
        "Kutch": ["Bhuj", "Gandhidham", "Anjar"],
        "Mahisagar": ["Lunawada", "Balasinor"],
        "Mehsana": ["Mehsana", "Unjha", "Visnagar"],
        "Morbi": ["Morbi", "Wankaner"],
        "Narmada": ["Rajpipla"],
        "Navsari": ["Navsari", "Vansda"],
        "Panchmahal": ["Godhra", "Halol"],
        "Patan": ["Patan", "Sidhpur"],
        "Porbandar": ["Porbandar"],
        "Rajkot": ["Rajkot", "Gondal", "Jetpur"],
        "Sabarkantha": ["Himatnagar", "Idar"],
        "Surat": ["Surat", "Bardoli", "Olpad"],
        "Surendranagar": ["Surendranagar", "Dhrangadhra"],
        "Tapi": ["Vyara"],
        "Vadodara": ["Vadodara", "Dabhoi", "Padra"],
        "Valsad": ["Valsad", "Vapi", "Dharampur"]
    },

    "Haryana": {
        "Ambala": ["Ambala", "Ambala Cantt"],
        "Bhiwani": ["Bhiwani", "Loharu"],
        "Charkhi Dadri": ["Charkhi Dadri"],
        "Faridabad": ["Faridabad", "Ballabhgarh"],
        "Fatehabad": ["Fatehabad", "Tohana"],
        "Gurugram": ["Gurugram", "Sohna", "Manesar"],
        "Hisar": ["Hisar", "Hansi"],
        "Jhajjar": ["Jhajjar", "Bahadurgarh"],
        "Jind": ["Jind", "Narwana"],
        "Kaithal": ["Kaithal", "Pundri"],
        "Karnal": ["Karnal", "Assandh"],
        "Kurukshetra": ["Kurukshetra", "Pehowa"],
        "Mahendragarh": ["Narnaul", "Mahendragarh"],
        "Nuh": ["Nuh", "Ferozepur Jhirka"],
        "Palwal": ["Palwal", "Hodal"],
        "Panchkula": ["Panchkula", "Kalka"],
        "Panipat": ["Panipat", "Samalkha"],
        "Rewari": ["Rewari", "Dharuhera"],
        "Rohtak": ["Rohtak", "Meham"],
        "Sirsa": ["Sirsa", "Dabwali"],
        "Sonipat": ["Sonipat", "Gohana"],
        "Yamunanagar": ["Yamunanagar", "Jagadhri"]
    },

    "Himachal Pradesh": {
        "Bilaspur": ["Bilaspur", "Ghumarwin"],
        "Chamba": ["Chamba", "Dalhousie"],
        "Hamirpur": ["Hamirpur", "Nadaun"],
        "Kangra": ["Dharamshala", "Kangra", "Palampur"],
        "Kinnaur": ["Reckong Peo", "Kalpa"],
        "Kullu": ["Kullu", "Manali"],
        "Lahaul and Spiti": ["Keylong", "Kaza"],
        "Mandi": ["Mandi", "Sundarnagar"],
        "Shimla": ["Shimla", "Rampur", "Theog"],
        "Sirmaur": ["Nahan", "Paonta Sahib"],
        "Solan": ["Solan", "Baddi"],
        "Una": ["Una", "Amb"]
    },

    "Jharkhand": {
        "Bokaro": ["Bokaro", "Chas"],
        "Chatra": ["Chatra"],
        "Deoghar": ["Deoghar", "Madhupur"],
        "Dhanbad": ["Dhanbad", "Sindri"],
        "Dumka": ["Dumka"],
        "East Singhbhum": ["Jamshedpur", "Ghatshila"],
        "Garhwa": ["Garhwa"],
        "Giridih": ["Giridih"],
        "Godda": ["Godda"],
        "Gumla": ["Gumla"],
        "Hazaribagh": ["Hazaribagh"],
        "Jamtara": ["Jamtara"],
        "Khunti": ["Khunti"],
        "Koderma": ["Koderma"],
        "Latehar": ["Latehar"],
        "Lohardaga": ["Lohardaga"],
        "Pakur": ["Pakur"],
        "Palamu": ["Medininagar", "Daltonganj"],
        "Ramgarh": ["Ramgarh"],
        "Ranchi": ["Ranchi", "Bundu"],
        "Sahibganj": ["Sahibganj", "Rajmahal"],
        "Seraikela Kharsawan": ["Seraikela", "Adityapur"],
        "Simdega": ["Simdega"],
        "West Singhbhum": ["Chaibasa", "Chakradharpur"]
    },

    "Karnataka": {
        "Bagalkot": ["Bagalkot", "Badami", "Jamkhandi"],
        "Ballari": ["Ballari", "Hospet", "Sandur"],
        "Belagavi": ["Belagavi", "Gokak", "Chikkodi"],
        "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hoskote"],
        "Bengaluru Urban": ["Bengaluru", "Anekal", "Yelahanka"],
        "Bidar": ["Bidar", "Basavakalyan"],
        "Chamarajanagar": ["Chamarajanagar", "Kollegal"],
        "Chikkaballapur": ["Chikkaballapur", "Sidlaghatta"],
        "Chikkamagaluru": ["Chikkamagaluru", "Kadur"],
        "Chitradurga": ["Chitradurga", "Hosadurga"],
        "Dakshina Kannada": ["Mangaluru", "Puttur"],
        "Davanagere": ["Davanagere", "Harihar"],
        "Dharwad": ["Dharwad", "Hubballi", "Kalghatgi"],
        "Gadag": ["Gadag", "Ron"],
        "Hassan": ["Hassan", "Sakleshpur"],
        "Haveri": ["Haveri", "Ranebennur"],
        "Kalaburagi": ["Kalaburagi", "Sedam", "Aland"],
        "Kodagu": ["Madikeri", "Virajpet"],
        "Kolar": ["Kolar", "Malur"],
        "Koppal": ["Koppal", "Gangavathi"],
        "Mandya": ["Mandya", "Maddur", "Srirangapatna"],
        "Mysuru": ["Mysuru", "Nanjangud", "Hunsur"],
        "Raichur": ["Raichur", "Manvi", "Sindhanur"],
        "Ramanagara": ["Ramanagara", "Channapatna"],
        "Shivamogga": ["Shivamogga", "Bhadravati", "Sagar"],
        "Tumakuru": ["Tumakuru", "Tiptur", "Sira"],
        "Udupi": ["Udupi", "Kundapura", "Karkala"],
        "Uttara Kannada": ["Karwar", "Sirsi", "Kumta"],
        "Vijayapura": ["Vijayapura", "Indi", "Sindagi"],
        "Yadgir": ["Yadgir", "Shorapur"]
    },

    "Kerala": {
        "Alappuzha": ["Alappuzha", "Cherthala", "Kayamkulam"],
        "Ernakulam": ["Kochi", "Aluva", "Perumbavoor", "Muvattupuzha"],
        "Idukki": ["Thodupuzha", "Munnar", "Kattappana"],
        "Kannur": ["Kannur", "Thalassery", "Payyannur"],
        "Kasaragod": ["Kasaragod", "Kanhangad"],
        "Kollam": ["Kollam", "Karunagappally", "Punalur"],
        "Kottayam": ["Kottayam", "Changanassery", "Pala"],
        "Kozhikode": ["Kozhikode", "Vadakara", "Koyilandy"],
        "Malappuram": ["Malappuram", "Manjeri", "Tirur"],
        "Palakkad": ["Palakkad", "Ottapalam", "Shoranur"],
        "Pathanamthitta": ["Pathanamthitta", "Adoor", "Thiruvalla"],
        "Thiruvananthapuram": [
            "Thiruvananthapuram",
            "Neyyattinkara",
            "Attingal"
        ],
        "Thrissur": ["Thrissur", "Chalakudy", "Kodungallur"],
        "Wayanad": ["Kalpetta", "Sulthan Bathery", "Mananthavady"]
    },

    "Madhya Pradesh": {
        "Agar Malwa": ["Agar", "Susner"],
        "Alirajpur": ["Alirajpur"],
        "Anuppur": ["Anuppur", "Kotma"],
        "Ashoknagar": ["Ashoknagar", "Chanderi"],
        "Balaghat": ["Balaghat", "Waraseoni"],
        "Barwani": ["Barwani", "Sendhwa"],
        "Betul": ["Betul", "Multai"],
        "Bhind": ["Bhind", "Gohad"],
        "Bhopal": ["Bhopal", "Berasia"],
        "Burhanpur": ["Burhanpur", "Nepanagar"],
        "Chhatarpur": ["Chhatarpur", "Khajuraho"],
        "Chhindwara": ["Chhindwara", "Pandhurna"],
        "Damoh": ["Damoh", "Hatta"],
        "Datia": ["Datia"],
        "Dewas": ["Dewas", "Sonkatch"],
        "Dhar": ["Dhar", "Manawar"],
        "Dindori": ["Dindori"],
        "Guna": ["Guna", "Raghogarh"],
        "Gwalior": ["Gwalior", "Dabra"],
        "Harda": ["Harda", "Timarni"],
        "Indore": ["Indore", "Mhow", "Depalpur"],
        "Jabalpur": ["Jabalpur", "Sihora"],
        "Jhabua": ["Jhabua", "Petlawad"],
        "Katni": ["Katni"],
        "Khandwa": ["Khandwa", "Pandhana"],
        "Khargone": ["Khargone", "Barwaha"],
        "Mandla": ["Mandla", "Nainpur"],
        "Mandsaur": ["Mandsaur", "Neemuch"],
        "Morena": ["Morena", "Sabalgarh"],
        "Narmadapuram": ["Narmadapuram", "Itarsi"],
        "Narsinghpur": ["Narsinghpur", "Gadarwara"],
        "Neemuch": ["Neemuch", "Manasa"],
        "Niwari": ["Niwari", "Orchha"],
        "Panna": ["Panna", "Ajaygarh"],
        "Raisen": ["Raisen", "Bareli"],
        "Rajgarh": ["Rajgarh", "Biaora"],
        "Ratlam": ["Ratlam", "Jaora"],
        "Rewa": ["Rewa", "Mauganj"],
        "Sagar": ["Sagar", "Bina"],
        "Satna": ["Satna", "Maihar"],
        "Sehore": ["Sehore", "Ashta"],
        "Seoni": ["Seoni", "Lakhnadon"],
        "Shahdol": ["Shahdol", "Burhar"],
        "Shajapur": ["Shajapur", "Agar"],
        "Sheopur": ["Sheopur", "Vijaypur"],
        "Shivpuri": ["Shivpuri", "Karera"],
        "Sidhi": ["Sidhi"],
        "Singrauli": ["Waidhan"],
        "Tikamgarh": ["Tikamgarh"],
        "Ujjain": ["Ujjain", "Nagda", "Tarana"],
        "Umaria": ["Umaria"],
        "Vidisha": ["Vidisha", "Basoda"]
    },

    "Maharashtra": {
        "Ahmednagar": ["Ahmednagar", "Sangamner", "Kopargaon"],
        "Akola": ["Akola", "Akot", "Murtizapur"],
        "Amravati": ["Amravati", "Achalpur", "Badnera"],
        "Aurangabad": ["Aurangabad", "Paithan", "Sillod"],
        "Beed": ["Beed", "Ambajogai"],
        "Bhandara": ["Bhandara", "Tumsar"],
        "Buldhana": ["Buldhana", "Khamgaon", "Malkapur"],
        "Chandrapur": ["Chandrapur", "Ballarpur"],
        "Dhule": ["Dhule", "Shirpur"],
        "Gadchiroli": ["Gadchiroli"],
        "Gondia": ["Gondia"],
        "Hingoli": ["Hingoli"],
        "Jalgaon": ["Jalgaon", "Bhusawal", "Chalisgaon"],
        "Jalna": ["Jalna", "Ambad"],
        "Kolhapur": ["Kolhapur", "Ichalkaranji", "Gadhinglaj"],
        "Latur": ["Latur", "Udgir"],
        "Mumbai City": ["Mumbai"],
        "Mumbai Suburban": ["Mumbai", "Andheri", "Borivali", "Bandra"],
        "Nagpur": ["Nagpur", "Kamptee"],
        "Nanded": ["Nanded", "Deglur"],
        "Nandurbar": ["Nandurbar", "Shahada"],
        "Nashik": ["Nashik", "Malegaon", "Sinnar"],
        "Osmanabad": ["Osmanabad", "Tuljapur"],
        "Palghar": ["Palghar", "Vasai", "Virar", "Dahanu"],
        "Parbhani": ["Parbhani", "Gangakhed"],
        "Pune": ["Pune", "Pimpri-Chinchwad", "Baramati", "Lonavala"],
        "Raigad": ["Alibag", "Panvel", "Karjat"],
        "Ratnagiri": ["Ratnagiri", "Chiplun"],
        "Sangli": ["Sangli", "Miraj", "Islampur"],
        "Satara": ["Satara", "Karad", "Phaltan"],
        "Sindhudurg": ["Oros", "Sawantwadi", "Malvan"],
        "Solapur": ["Solapur", "Akkalkot", "Barshi"],
        "Thane": ["Thane", "Kalyan", "Dombivli", "Bhiwandi"],
        "Wardha": ["Wardha", "Hinganghat"],
        "Washim": ["Washim"],
        "Yavatmal": ["Yavatmal", "Wani", "Pusad"]
    },

    "Manipur": {
        "Bishnupur": ["Bishnupur", "Moirang"],
        "Chandel": ["Chandel"],
        "Churachandpur": ["Churachandpur"],
        "Imphal East": ["Porompat", "Sawombung"],
        "Imphal West": ["Imphal"],
        "Jiribam": ["Jiribam"],
        "Kakching": ["Kakching"],
        "Kamjong": ["Kamjong"],
        "Kangpokpi": ["Kangpokpi"],
        "Noney": ["Noney"],
        "Pherzawl": ["Pherzawl"],
        "Senapati": ["Senapati"],
        "Tamenglong": ["Tamenglong"],
        "Tengnoupal": ["Tengnoupal"],
        "Thoubal": ["Thoubal"],
        "Ukhrul": ["Ukhrul"]
    },

    "Meghalaya": {
        "East Garo Hills": ["Williamnagar"],
        "East Jaintia Hills": ["Khliehriat"],
        "East Khasi Hills": ["Shillong", "Cherrapunji"],
        "North Garo Hills": ["Resubelpara"],
        "Ri-Bhoi": ["Nongpoh"],
        "South Garo Hills": ["Baghmara"],
        "South West Garo Hills": ["Ampati"],
        "South West Khasi Hills": ["Mawkyrwat"],
        "West Garo Hills": ["Tura"],
        "West Jaintia Hills": ["Jowai"],
        "West Khasi Hills": ["Nongstoin"]
    },

    "Mizoram": {
        "Aizawl": ["Aizawl"],
        "Champhai": ["Champhai"],
        "Hnahthial": ["Hnahthial"],
        "Khawzawl": ["Khawzawl"],
        "Kolasib": ["Kolasib"],
        "Lawngtlai": ["Lawngtlai"],
        "Lunglei": ["Lunglei"],
        "Mamit": ["Mamit"],
        "Saiha": ["Siaha"],
        "Serchhip": ["Serchhip"]
    },

    "Nagaland": {
        "Chumoukedima": ["Chumoukedima", "Dimapur"],
        "Dimapur": ["Dimapur"],
        "Kiphire": ["Kiphire"],
        "Kohima": ["Kohima"],
        "Longleng": ["Longleng"],
        "Mokokchung": ["Mokokchung"],
        "Mon": ["Mon"],
        "Niuland": ["Niuland"],
        "Noklak": ["Noklak"],
        "Peren": ["Peren"],
        "Phek": ["Phek"],
        "Shamator": ["Shamator"],
        "Tuensang": ["Tuensang"],
        "Wokha": ["Wokha"],
        "Zunheboto": ["Zunheboto"]
    },

    "Odisha": {
        "Angul": ["Angul", "Talcher"],
        "Balangir": ["Balangir", "Titlagarh"],
        "Balasore": ["Balasore", "Jaleswar"],
        "Bargarh": ["Bargarh", "Padampur"],
        "Bhadrak": ["Bhadrak", "Basudevpur"],
        "Boudh": ["Boudh"],
        "Cuttack": ["Cuttack", "Athagarh"],
        "Deogarh": ["Deogarh"],
        "Dhenkanal": ["Dhenkanal", "Kamakhyanagar"],
        "Gajapati": ["Paralakhemundi"],
        "Ganjam": ["Berhampur", "Chatrapur", "Bhanjanagar"],
        "Jagatsinghpur": ["Jagatsinghpur", "Paradip"],
        "Jajpur": ["Jajpur", "Vyasanagar"],
        "Jharsuguda": ["Jharsuguda", "Brajarajnagar"],
        "Kalahandi": ["Bhawanipatna", "Dharamgarh"],
        "Kandhamal": ["Phulbani"],
        "Kendrapara": ["Kendrapara", "Pattamundai"],
        "Kendujhar": ["Keonjhar", "Barbil"],
        "Khordha": ["Bhubaneswar", "Khordha", "Jatani"],
        "Koraput": ["Koraput", "Jeypore", "Sunabeda"],
        "Malkangiri": ["Malkangiri"],
        "Mayurbhanj": ["Baripada", "Rairangpur"],
        "Nabarangpur": ["Nabarangpur"],
        "Nayagarh": ["Nayagarh"],
        "Nuapada": ["Nuapada", "Khariar"],
        "Puri": ["Puri", "Konark", "Pipili"],
        "Rayagada": ["Rayagada", "Gunupur"],
        "Sambalpur": ["Sambalpur", "Hirakud"],
        "Subarnapur": ["Sonepur", "Binka"],
        "Sundargarh": ["Sundargarh", "Rourkela", "Rajgangpur"]
    },

    "Punjab": {
        "Amritsar": ["Amritsar", "Ajnala", "Baba Bakala"],
        "Barnala": ["Barnala"],
        "Bathinda": ["Bathinda", "Rampura Phul"],
        "Faridkot": ["Faridkot", "Kotkapura"],
        "Fatehgarh Sahib": ["Fatehgarh Sahib", "Mandi Gobindgarh"],
        "Fazilka": ["Fazilka", "Abohar"],
        "Ferozepur": ["Ferozepur", "Zira"],
        "Gurdaspur": ["Gurdaspur", "Batala", "Dera Baba Nanak"],
        "Hoshiarpur": ["Hoshiarpur", "Dasuya"],
        "Jalandhar": ["Jalandhar", "Phagwara", "Nakodar"],
        "Kapurthala": ["Kapurthala", "Phagwara"],
        "Ludhiana": ["Ludhiana", "Khanna", "Jagraon"],
        "Malerkotla": ["Malerkotla"],
        "Mansa": ["Mansa", "Budhlada"],
        "Moga": ["Moga", "Baghapurana"],
        "Pathankot": ["Pathankot"],
        "Patiala": ["Patiala", "Rajpura", "Nabha"],
        "Rupnagar": ["Rupnagar", "Anandpur Sahib"],
        "Sahibzada Ajit Singh Nagar": ["Mohali", "Kharar", "Dera Bassi"],
        "Sangrur": ["Sangrur", "Sunam"],
        "Shaheed Bhagat Singh Nagar": ["Nawanshahr", "Balachaur"],
        "Sri Muktsar Sahib": ["Muktsar", "Malout"],
        "Tarn Taran": ["Tarn Taran", "Patti"]
    },

    "Rajasthan": {
        "Ajmer": ["Ajmer", "Kishangarh", "Beawar"],
        "Alwar": ["Alwar", "Bhiwadi", "Neemrana"],
        "Banswara": ["Banswara", "Ghatol"],
        "Baran": ["Baran", "Chhabra"],
        "Barmer": ["Barmer", "Balotra"],
        "Bharatpur": ["Bharatpur", "Deeg"],
        "Bhilwara": ["Bhilwara", "Shahpura"],
        "Bikaner": ["Bikaner", "Nokha"],
        "Bundi": ["Bundi", "Keshoraipatan"],
        "Chittorgarh": ["Chittorgarh", "Nimbahera"],
        "Churu": ["Churu", "Sujangarh"],
        "Dausa": ["Dausa", "Bandikui"],
        "Dholpur": ["Dholpur", "Bari"],
        "Dungarpur": ["Dungarpur", "Sagwara"],
        "Hanumangarh": ["Hanumangarh", "Nohar"],
        "Jaipur": ["Jaipur", "Amer", "Sanganer"],
        "Jaisalmer": ["Jaisalmer", "Pokaran"],
        "Jalore": ["Jalore", "Bhinmal"],
        "Jhalawar": ["Jhalawar", "Bhawani Mandi"],
        "Jhunjhunu": ["Jhunjhunu", "Pilani"],
        "Jodhpur": ["Jodhpur", "Phalodi", "Bilara"],
        "Karauli": ["Karauli", "Hindaun"],
        "Kota": ["Kota", "Ramganj Mandi"],
        "Nagaur": ["Nagaur", "Merta City", "Didwana"],
        "Pali": ["Pali", "Sumerpur"],
        "Pratapgarh": ["Pratapgarh"],
        "Rajsamand": ["Rajsamand", "Nathdwara"],
        "Sawai Madhopur": ["Sawai Madhopur", "Gangapur City"],
        "Sikar": ["Sikar", "Fatehpur"],
        "Sirohi": ["Sirohi", "Abu Road"],
        "Sri Ganganagar": ["Sri Ganganagar", "Suratgarh"],
        "Tonk": ["Tonk", "Deoli"],
        "Udaipur": ["Udaipur", "Salumbar", "Gogunda"]
    },

    "Sikkim": {
        "Gangtok": ["Gangtok", "Rangpo"],
        "Mangan": ["Mangan"],
        "Namchi": ["Namchi"],
        "Pakyong": ["Pakyong"],
        "Soreng": ["Soreng"],
        "Gyalshing": ["Gyalshing"]
    },

    "Tamil Nadu": {
        "Ariyalur": ["Ariyalur", "Jayankondam"],
        "Chengalpattu": ["Chengalpattu", "Tambaram", "Mahabalipuram"],
        "Chennai": ["Chennai"],
        "Coimbatore": ["Coimbatore", "Pollachi", "Mettupalayam"],
        "Cuddalore": ["Cuddalore", "Chidambaram", "Panruti"],
        "Dharmapuri": ["Dharmapuri", "Palacode"],
        "Dindigul": ["Dindigul", "Palani", "Oddanchatram"],
        "Erode": ["Erode", "Bhavani", "Gobichettipalayam"],
        "Kallakurichi": ["Kallakurichi"],
        "Kanchipuram": ["Kanchipuram", "Sriperumbudur"],
        "Kanyakumari": ["Nagercoil", "Marthandam", "Colachel"],
        "Karur": ["Karur", "Kulithalai"],
        "Krishnagiri": ["Krishnagiri", "Hosur"],
        "Madurai": ["Madurai", "Melur", "Thirumangalam"],
        "Mayiladuthurai": ["Mayiladuthurai", "Sirkazhi"],
        "Nagapattinam": ["Nagapattinam", "Vedaranyam"],
        "Namakkal": ["Namakkal", "Tiruchengode"],
        "Nilgiris": ["Ooty", "Coonoor", "Gudalur"],
        "Perambalur": ["Perambalur"],
        "Pudukkottai": ["Pudukkottai", "Aranthangi"],
        "Ramanathapuram": ["Ramanathapuram", "Rameswaram"],
        "Ranipet": ["Ranipet", "Arcot"],
        "Salem": ["Salem", "Mettur", "Attur"],
        "Sivaganga": ["Sivaganga", "Karaikudi"],
        "Tenkasi": ["Tenkasi", "Sengottai"],
        "Thanjavur": ["Thanjavur", "Kumbakonam", "Pattukkottai"],
        "Theni": ["Theni", "Periyakulam"],
        "Thoothukudi": ["Thoothukudi", "Kovilpatti"],
        "Tiruchirappalli": ["Tiruchirappalli", "Srirangam", "Manapparai"],
        "Tirunelveli": ["Tirunelveli", "Palayamkottai"],
        "Tirupathur": ["Tirupathur", "Vaniyambadi"],
        "Tiruppur": ["Tiruppur", "Dharapuram"],
        "Tiruvallur": ["Tiruvallur", "Avadi", "Ponneri"],
        "Tiruvannamalai": ["Tiruvannamalai", "Arani"],
        "Tiruvarur": ["Tiruvarur", "Mannargudi"],
        "Vellore": ["Vellore", "Katpadi"],
        "Viluppuram": ["Viluppuram", "Tindivanam"],
        "Virudhunagar": ["Virudhunagar", "Sivakasi", "Rajapalayam"]
    },

    "Telangana": {
        "Adilabad": ["Adilabad", "Mancherial"],
        "Bhadradri Kothagudem": ["Kothagudem", "Bhadrachalam"],
        "Hyderabad": ["Hyderabad", "Secunderabad"],
        "Jagtial": ["Jagtial", "Metpally"],
        "Jangaon": ["Jangaon"],
        "Jayashankar Bhupalpally": ["Bhupalpally"],
        "Jogulamba Gadwal": ["Gadwal"],
        "Kamareddy": ["Kamareddy", "Banswada"],
        "Karimnagar": ["Karimnagar", "Huzurabad"],
        "Khammam": ["Khammam", "Madhira"],
        "Komaram Bheem": ["Asifabad"],
        "Mahabubabad": ["Mahabubabad"],
        "Mahbubnagar": ["Mahbubnagar", "Jadcherla"],
        "Mancherial": ["Mancherial", "Bellampalli"],
        "Medak": ["Medak", "Narsapur"],
        "Medchal-Malkajgiri": ["Medchal", "Malkajgiri", "Kukatpally"],
        "Mulugu": ["Mulugu"],
        "Nagarkurnool": ["Nagarkurnool", "Achampet"],
        "Nalgonda": ["Nalgonda", "Miryalaguda"],
        "Narayanpet": ["Narayanpet"],
        "Nirmal": ["Nirmal", "Bhainsa"],
        "Nizamabad": ["Nizamabad", "Bodhan", "Armoor"],
        "Peddapalli": ["Peddapalli", "Ramagundam"],
        "Rajanna Sircilla": ["Sircilla"],
        "Rangareddy": ["Ibrahimpatnam", "Shamshabad", "Chevella"],
        "Sangareddy": ["Sangareddy", "Zaheerabad"],
        "Siddipet": ["Siddipet", "Gajwel"],
        "Suryapet": ["Suryapet", "Kodad"],
        "Vikarabad": ["Vikarabad", "Tandur"],
        "Wanaparthy": ["Wanaparthy"],
        "Warangal": ["Warangal", "Hanamkonda"],
        "Yadadri Bhuvanagiri": ["Bhongir", "Yadagirigutta"]
    },

    "Uttar Pradesh": {
        "Agra": ["Agra", "Fatehabad"],
        "Aligarh": ["Aligarh", "Khair", "Atrauli"],
        "Ambedkar Nagar": ["Akbarpur", "Tanda"],
        "Amethi": ["Gauriganj", "Amethi"],
        "Amroha": ["Amroha", "Gajraula"],
        "Auraiya": ["Auraiya", "Dibiyapur"],
        "Ayodhya": ["Ayodhya", "Faizabad", "Rudauli"],
        "Azamgarh": ["Azamgarh", "Mubarakpur"],
        "Baghpat": ["Baghpat", "Baraut"],
        "Bahraich": ["Bahraich", "Nanpara"],
        "Ballia": ["Ballia", "Rasra"],
        "Balrampur": ["Balrampur", "Tulsipur"],
        "Banda": ["Banda", "Atarra"],
        "Barabanki": ["Barabanki", "Nawabganj"],
        "Bareilly": ["Bareilly", "Aonla"],
        "Basti": ["Basti", "Harraiya"],
        "Bhadohi": ["Gyanpur", "Bhadohi"],
        "Bijnor": ["Bijnor", "Nagina", "Najibabad"],
        "Budaun": ["Budaun", "Sahaswan"],
        "Bulandshahr": ["Bulandshahr", "Khurja"],
        "Chandauli": ["Chandauli", "Mughalsarai"],
        "Chitrakoot": ["Karwi", "Manikpur"],
        "Deoria": ["Deoria", "Barhaj"],
        "Etah": ["Etah"],
        "Etawah": ["Etawah", "Jaswantnagar"],
        "Farrukhabad": ["Farrukhabad", "Fatehgarh"],
        "Fatehpur": ["Fatehpur", "Bindki"],
        "Firozabad": ["Firozabad", "Shikohabad"],
        "Gautam Buddha Nagar": ["Noida", "Greater Noida", "Dadri"],
        "Ghaziabad": ["Ghaziabad", "Loni", "Modinagar"],
        "Ghazipur": ["Ghazipur", "Zamania"],
        "Gonda": ["Gonda", "Colonelganj"],
        "Gorakhpur": ["Gorakhpur", "Sahjanwa"],
        "Hamirpur": ["Hamirpur", "Rath"],
        "Hapur": ["Hapur", "Pilkhuwa"],
        "Hardoi": ["Hardoi", "Shahabad"],
        "Hathras": ["Hathras", "Sikandra Rao"],
        "Jalaun": ["Orai", "Kalpi"],
        "Jaunpur": ["Jaunpur", "Shahganj"],
        "Jhansi": ["Jhansi", "Mauranipur"],
        "Kannauj": ["Kannauj", "Chhibramau"],
        "Kanpur Dehat": ["Akbarpur", "Pukhrayan"],
        "Kanpur Nagar": ["Kanpur", "Bilhaur"],
        "Kasganj": ["Kasganj", "Soron"],
        "Kaushambi": ["Manjhanpur", "Sirathu"],
        "Kushinagar": ["Padrauna", "Kasia"],
        "Lakhimpur Kheri": ["Lakhimpur", "Gola Gokaran Nath"],
        "Lalitpur": ["Lalitpur", "Talbehat"],
        "Lucknow": ["Lucknow", "Malihabad", "Mohan"],
        "Maharajganj": ["Maharajganj", "Nautanwa"],
        "Mahoba": ["Mahoba", "Charkhari"],
        "Mainpuri": ["Mainpuri", "Bhogaon"],
        "Mathura": ["Mathura", "Vrindavan", "Kosi Kalan"],
        "Mau": ["Mau", "Ghosi"],
        "Meerut": ["Meerut", "Modinagar"],
        "Mirzapur": ["Mirzapur", "Chunar"],
        "Moradabad": ["Moradabad", "Thakurdwara"],
        "Muzaffarnagar": ["Muzaffarnagar"],
        "Pilibhit": ["Pilibhit", "Puranpur"],
        "Pratapgarh": ["Pratapgarh", "Kunda"],
        "Prayagraj": ["Prayagraj", "Phulpur", "Naini"],
        "Raebareli": ["Raebareli", "Lalganj"],
        "Rampur": ["Rampur", "Swar"],
        "Saharanpur": ["Saharanpur", "Deoband"],
        "Sambhal": ["Sambhal", "Chandausi"],
        "Sant Kabir Nagar": ["Khalilabad", "Mehdawal"],
        "Shahjahanpur": ["Shahjahanpur", "Tilhar"],
        "Shamli": ["Shamli", "Kairana"],
        "Shrawasti": ["Bhinga"],
        "Siddharthnagar": ["Naugarh", "Bansi"],
        "Sitapur": ["Sitapur", "Biswan"],
        "Sonbhadra": ["Robertsganj", "Renukoot"],
        "Sultanpur": ["Sultanpur", "Kadipur"],
        "Unnao": ["Unnao", "Safipur"],
        "Varanasi": ["Varanasi", "Ramnagar", "Pindra"]
    },

    "Uttarakhand": {
        "Almora": ["Almora", "Ranikhet"],
        "Bageshwar": ["Bageshwar"],
        "Chamoli": ["Gopeshwar", "Joshimath"],
        "Champawat": ["Champawat", "Lohaghat"],
        "Dehradun": ["Dehradun", "Rishikesh", "Vikasnagar"],
        "Haridwar": ["Haridwar", "Roorkee", "Manglaur"],
        "Nainital": ["Nainital", "Haldwani", "Ramnagar"],
        "Pauri Garhwal": ["Pauri", "Kotdwar", "Srinagar"],
        "Pithoragarh": ["Pithoragarh", "Dharchula"],
        "Rudraprayag": ["Rudraprayag"],
        "Tehri Garhwal": ["New Tehri", "Narendranagar"],
        "Udham Singh Nagar": ["Rudrapur", "Kashipur", "Khatima"],
        "Uttarkashi": ["Uttarkashi"]
    },

    "West Bengal": {
        "Alipurduar": ["Alipurduar", "Falakata"],
        "Bankura": ["Bankura", "Bishnupur"],
        "Paschim Bardhaman": ["Asansol", "Durgapur"],
        "Purba Bardhaman": ["Bardhaman", "Katwa"],
        "Birbhum": ["Suri", "Bolpur"],
        "Cooch Behar": ["Cooch Behar", "Dinhata"],
        "Darjeeling": ["Darjeeling", "Siliguri", "Kurseong"],
        "Hooghly": ["Chinsurah", "Serampore", "Chandannagar"],
        "Howrah": ["Howrah", "Uluberia"],
        "Jalpaiguri": ["Jalpaiguri", "Malbazar"],
        "Jhargram": ["Jhargram"],
        "Kalimpong": ["Kalimpong"],
        "Kolkata": ["Kolkata"],
        "Maldah": ["Malda", "English Bazar"],
        "Murshidabad": ["Berhampore", "Jangipur"],
        "Nadia": ["Krishnanagar", "Kalyani", "Ranaghat"],
        "North 24 Parganas": ["Barasat", "New Town", "Bidhannagar"],
        "South 24 Parganas": ["Alipore", "Diamond Harbour", "Canning"],
        "Paschim Medinipur": ["Medinipur", "Kharagpur"],
        "Purba Medinipur": ["Tamluk", "Haldia", "Contai"],
        "Purulia": ["Purulia"]
    },

    "Delhi": {
        "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj"],
        "East Delhi": ["Preet Vihar", "Mayur Vihar", "Laxmi Nagar"],
        "New Delhi": ["New Delhi", "Chanakyapuri", "Vasant Kunj", "Saket"],
        "North Delhi": ["Model Town", "Civil Lines", "GTB Nagar"],
        "North East Delhi": ["Seelampur", "Yamuna Vihar"],
        "North West Delhi": ["Rohini", "Pitampura", "Narela"],
        "Shahdara": ["Shahdara", "Vivek Vihar"],
        "South Delhi": ["Hauz Khas", "Greater Kailash", "Lajpat Nagar"],
        "South East Delhi": ["Jangpura", "Kalkaji", "Okhla"],
        "South West Delhi": ["Dwarka", "Najafgarh", "Vasant Kunj"],
        "West Delhi": ["Rajouri Garden", "Janakpuri", "Punjabi Bagh"]
    },

    "Jammu and Kashmir": {
        "Anantnag": [
            "Anantnag",
            "Bijbehara",
            "Pahalgam",
            "Kokernag",
            "Verinag"
        ],
        "Bandipora": ["Bandipora", "Sumbal", "Gurez"],
        "Baramulla": [
            "Baramulla",
            "Sopore",
            "Pattan",
            "Tangmarg",
            "Uri"
        ],
        "Budgam": [
            "Budgam",
            "Beerwah",
            "Chadoora",
            "Magam",
            "Khan Sahib"
        ],
        "Doda": ["Doda", "Bhaderwah", "Thathri"],
        "Ganderbal": ["Ganderbal", "Kangan", "Tullamulla"],
        "Jammu": ["Jammu", "Akhnoor", "R.S. Pura"],
        "Kathua": ["Kathua", "Hiranagar", "Billawar"],
        "Kishtwar": ["Kishtwar"],
        "Kulgam": ["Kulgam", "Qazigund"],
        "Kupwara": ["Kupwara", "Handwara", "Karnah", "Lolab"],
        "Poonch": ["Poonch", "Surankote"],
        "Pulwama": [
            "Pulwama",
            "Pampore",
            "Tral",
            "Awantipora"
        ],
        "Rajouri": ["Rajouri", "Nowshera"],
        "Ramban": ["Ramban", "Banihal"],
        "Reasi": ["Reasi", "Katra"],
        "Samba": ["Samba", "Vijaypur"],
        "Shopian": ["Shopian"],
        "Srinagar": [
            "Srinagar",
            "Lal Bazar",
            "Hazratbal",
            "Downtown Srinagar",
            "Rajbagh",
            "Sonwar",
            "Nishat",
            "Shalimar",
            "Soura"
        ],
        "Udhampur": ["Udhampur", "Chenani"]
    },

    "Ladakh": {
        "Leh": ["Leh", "Nubra", "Khaltse"],
        "Kargil": ["Kargil", "Drass", "Zanskar"]
    },

    "Puducherry": {
        "Puducherry": [
            "Puducherry",
            "Oulgaret",
            "Villianur",
            "Ariyankuppam"
        ],
        "Karaikal": ["Karaikal"],
        "Mahe": ["Mahe"],
        "Yanam": ["Yanam"]
    },

    "Chandigarh": {
        "Chandigarh": ["Chandigarh"]
    },

    "Dadra and Nagar Haveli and Daman and Diu": {
        "Dadra and Nagar Haveli": ["Silvassa"],
        "Daman": ["Daman"],
        "Diu": ["Diu"]
    },

    "Lakshadweep": {
        "Lakshadweep": [
            "Kavaratti",
            "Agatti",
            "Amini",
            "Andrott",
            "Kalpeni",
            "Minicoy"
        ]
    }
};


// ============================================================
// STATE LIST
// ============================================================

export const INDIA_STATES = Object.keys(INDIA_LOCATION_DATA).sort(
    (a, b) => a.localeCompare(b)
);


// Backward-compatible name used by older AddProduct code.
export const DELIVERY_LOCATIONS = INDIA_LOCATION_DATA;


// ============================================================
// STATE HELPERS
// ============================================================

export const getIndiaStates = (state) => {
    if (!state || state === "Anywhere") {
        return null;
    }

    const canonicalState = resolveIndiaState(state);

    return INDIA_LOCATION_DATA[canonicalState] || null;
};


// ============================================================
// DISTRICT HELPERS
// ============================================================

export const getIndiaDistricts = (state) => {
    const record = getIndiaStates(state);

    if (!record) {
        return [];
    }

    return Object.keys(record).sort((a, b) =>
        a.localeCompare(b)
    );
};


// ============================================================
// CITY HELPERS
// ============================================================

export const getIndiaCities = (state, district) => {
    if (
        !state ||
        state === "Anywhere" ||
        !district ||
        district === "Anywhere"
    ) {
        return [];
    }

    const record = getIndiaStates(state);

    if (!record || !record[district]) {
        return [];
    }

    return [...new Set(record[district])].sort((a, b) =>
        a.localeCompare(b)
    );
};


// ============================================================
// NORMALIZATION
// ============================================================

export const normalizeLocationValue = (value = "") => {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[’']/g, "")
        .replace(/[\s_-]+/g, " ");
};


// Common legacy/alternate names.
const STATE_ALIASES = {
    "jammu and kashmir": "Jammu and Kashmir",
    "jammu kashmir": "Jammu and Kashmir",
    "jammu & kashmir": "Jammu and Kashmir",

    "nct of delhi": "Delhi",
    "delhi nct": "Delhi",

    "pondicherry": "Puducherry"
};


// Resolve an incoming state value to the canonical state name.
export const resolveIndiaState = (value = "") => {
    const normalized = normalizeLocationValue(value);

    if (!normalized) {
        return "";
    }

    if (STATE_ALIASES[normalized]) {
        return STATE_ALIASES[normalized];
    }

    const exactMatch = INDIA_STATES.find(
        (state) =>
            normalizeLocationValue(state) === normalized
    );

    return exactMatch || String(value).trim();
};


// ============================================================
// LOCATION NORMALIZATION
// ============================================================

export const normalizeLocation = (location = {}) => {
    if (typeof location === "string") {
        return {
            state: resolveIndiaState(location),
            district: "",
            city: ""
        };
    }

    if (!location || typeof location !== "object") {
        return { state: "", district: "", city: "" };
    }

    return {
        state: resolveIndiaState(location.state || ""),
        district: String(location.district || "").trim(),
        city: String(location.city || "").trim()
    };
};

// Normalize, validate, and deduplicate the persisted delivery schema.
export const normalizeDeliveryLocations = (locations = []) => {
    if (!Array.isArray(locations)) {
        return [];
    }

    const normalizedLocations = locations
        .map((location) => normalizeLocation(location))
        .map((location) => {
            if (normalizeLocationValue(location.state) === "anywhere") {
                return { state: "Anywhere", district: "", city: "" };
            }

            if (normalizeLocationValue(location.district) === "anywhere") {
                return { state: location.state, district: "Anywhere", city: "" };
            }

            if (normalizeLocationValue(location.city) === "anywhere") {
                return { state: location.state, district: location.district, city: "Anywhere" };
            }

            return location;
        })
        .filter((location) => {
            if (!location.state) {
                return false;
            }

            if (normalizeLocationValue(location.state) === "anywhere") {
                return true;
            }

            const stateRecord = getIndiaStates(location.state);
            if (!stateRecord) {
                return false;
            }

            const districts = Object.keys(stateRecord);
            if (location.district && normalizeLocationValue(location.district) !== "anywhere" && !districts.includes(location.district)) {
                return false;
            }

            if (location.city && normalizeLocationValue(location.city) !== "anywhere") {
                if (!location.district || normalizeLocationValue(location.district) === "anywhere") {
                    return false;
                }

                return getIndiaCities(location.state, location.district).includes(location.city);
            }

            return true;
        })
        .map((location) => ({
            state: location.state,
            district: location.district,
            city: location.city
        }));

    return normalizedLocations.filter((location, index, allLocations) =>
        allLocations.findIndex((candidate) =>
            normalizeLocationValue(candidate.state) === normalizeLocationValue(location.state) &&
            normalizeLocationValue(candidate.district) === normalizeLocationValue(location.district) &&
            normalizeLocationValue(candidate.city) === normalizeLocationValue(location.city)
        ) === index
    );
};


// ============================================================
// LOCATION MATCHING
// ============================================================

export const locationMatches = (
    productLocation = {},
    selectedState = "",
    selectedDistrict = "",
    selectedCity = ""
) => {
    const location = normalizeLocation(productLocation);

    const state = normalizeLocationValue(selectedState);
    const district = normalizeLocationValue(selectedDistrict);
    const city = normalizeLocationValue(selectedCity);

    const savedState = normalizeLocationValue(location.state);
    const savedDistrict = normalizeLocationValue(location.district);
    const savedCity = normalizeLocationValue(location.city);

    if (!savedState || savedState === "anywhere") {
        return true;
    }

    // State filter.
    if (state && state !== "anywhere") {
        if (
            savedState !== state
        ) {
            return false;
        }
    }

    if (!state || state === "anywhere") {
        return true;
    }

    if (!savedDistrict || savedDistrict === "anywhere") {
        return true;
    }

    // District filter.
    if (district && district !== "anywhere") {
        if (
            savedDistrict !== district
        ) {
            return false;
        }
    }

    if (!district || district === "anywhere") {
        return true;
    }

    if (!savedCity || savedCity === "anywhere") {
        return true;
    }

    // City filter.
    if (city && city !== "anywhere") {
        if (
            savedCity !== city
        ) {
            return false;
        }
    }

    return true;
};


// ============================================================
// PRODUCT DELIVERY CHECK
// ============================================================
//
// Products without deliveryLocations are treated as available
// everywhere for backward compatibility with existing products.
//
// A product with deliveryLocations is considered deliverable when
// at least one saved location matches the requested destination.
//

export const productSupportsLocation = (
    deliveryLocations = [],
    selectedState = "",
    selectedDistrict = "",
    selectedCity = ""
) => {
    if (
        !Array.isArray(deliveryLocations) ||
        deliveryLocations.length === 0
    ) {
        return true;
    }

    return deliveryLocations.some((location) =>
        locationMatches(
            location,
            selectedState,
            selectedDistrict,
            selectedCity
        )
    );
};


// ============================================================
// LOCATION FORMATTER
// ============================================================

export const formatLocation = (location = {}) => {
    const normalized = normalizeLocation(location);

    if (
        normalizeLocationValue(normalized.state) === "anywhere" ||
        normalizeLocationValue(normalized.district) === "anywhere" ||
        normalizeLocationValue(normalized.city) === "anywhere"
    ) {
        if (normalizeLocationValue(normalized.state) === "anywhere") {
            return "Anywhere";
        }
    }

    return [
        normalized.city,
        normalized.district,
        normalized.state
    ]
        .filter(Boolean)
        .filter((value) => value !== "Anywhere")
        .join(", ");
};


// ============================================================
// LOCATION LABEL
// ============================================================
//
// Useful for chips/cards in ProductDetails and SellerDashboard.
//

export const getLocationLabel = (location = {}) => {
    const normalized = normalizeLocation(location);

    if (normalizeLocationValue(normalized.state) === "anywhere") {
        return "Anywhere";
    }

    const parts = [];

    if (
        normalized.city &&
        normalized.city !== "Anywhere"
    ) {
        parts.push(normalized.city);
    }

    if (
        normalized.district &&
        normalized.district !== "Anywhere"
    ) {
        parts.push(normalized.district);
    }

    if (
        normalized.state &&
        normalized.state !== "Anywhere"
    ) {
        parts.push(normalized.state);
    }

    return parts.join(" > ");
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default INDIA_LOCATION_DATA;