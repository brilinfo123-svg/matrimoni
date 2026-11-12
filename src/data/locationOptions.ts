// src/data/locationOptions.ts

export type LocationOption = {
  state: string;
  cities: string[];
};

export const locationOptions: LocationOption[] = [
  { state: "All", cities: ["All"] },
  { state: "Andhra Pradesh", cities: ["All", "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole", "Machilipatnam", "Srikakulam", "Vizianagaram"] },
  { state: "Arunachal Pradesh", cities: ["All", "Itanagar", "Naharlagun", "Tawang", "Bomdila", "Pasighat", "Ziro", "Along", "Tezu", "Namsai", "Roing"] },
  { state: "Assam", cities: ["All", "Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Sivasagar", "Dhubri", "Barpeta", "Bongaigaon", "Goalpara", "North Lakhimpur"] },
  { state: "Bihar", cities: ["All", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Bettiah", "Saharsa", "Hajipur", "Sasaram"] },
  { state: "Chhattisgarh", cities: ["All", "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Dhamtari"] },
  { state: "Goa", cities: ["All", "Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Canacona"] },
  { state: "Gujarat", cities: ["All", "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar", "Junagadh", "Anand", "Nadiad", "Bharuch", "Vapi", "Navsari", "Morbi", "Mehsana", "Palanpur", "Porbandar", "Godhra", "Botad", "Surendranagar"] },
  { state: "Haryana", cities: ["All", "Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Rohtak", "Sonipat", "Karnal", "Panchkula", "Yamunanagar", "Bhiwani", "Sirsa", "Rewari", "Palwal", "Jind", "Kaithal", "Kurukshetra", "Fatehabad", "Narnaul", "Bahadurgarh"] },
  { state: "Himachal Pradesh", cities: ["All", "Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Bilaspur", "Hamirpur", "Una", "Chamba", "Nahan", "Kangra", "Baddi"] },
  { state: "Jharkhand", cities: ["All", "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chaibasa", "Dumka"] },
  { state: "Karnataka", cities: ["All", "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Dharwad", "Kalaburagi", "Davangere", "Ballari", "Shivamogga", "Tumakuru", "Udupi", "Hassan", "Raichur", "Vijayapura", "Bidar", "Chikkamagaluru", "Mandya", "Kolar", "Chitradurga"] },
  { state: "Kerala", cities: ["All", "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad"] },
  { state: "Madhya Pradesh", cities: ["All", "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Burhanpur", "Khandwa", "Chhindwara", "Morena", "Bhind", "Vidisha", "Shivpuri"] },
  { state: "Maharashtra", cities: ["All", "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Navi Mumbai", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Ahmednagar", "Chandrapur", "Dhule", "Satara", "Ratnagiri", "Beed", "Parbhani", "Yavatmal", "Bhiwandi"] },
  { state: "Manipur", cities: ["All", "Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul", "Senapati", "Tamenglong", "Kakching"] },
  { state: "Meghalaya", cities: ["All", "Shillong", "Tura", "Jowai", "Nongpoh", "Nongstoin", "Williamnagar", "Baghmara"] },
  { state: "Mizoram", cities: ["All", "Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip", "Saiha", "Lawngtlai"] },
  { state: "Nagaland", cities: ["All", "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Phek", "Zunheboto", "Kiphire", "Longleng"] },
  { state: "Odisha", cities: ["All", "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda", "Jeypore", "Angul", "Dhenkanal", "Rayagada", "Koraput", "Bargarh"] },
  { state: "Punjab", cities: ["All", "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Batala", "Abohar", "Firozpur", "Kapurthala", "Sangrur", "Barnala"] },
  { state: "Rajasthan", cities: ["All", "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Bhilwara", "Sri Ganganagar", "Sikar", "Pali", "Kishangarh", "Tonk", "Beawar", "Hanumangarh", "Chittorgarh", "Barmer", "Jaisalmer", "Dausa"] },
  { state: "Sikkim", cities: ["All", "Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla", "Singtam"] },
  { state: "Tamil Nadu", cities: ["All", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Thanjavur", "Tirunelveli", "Nagercoil", "Kanchipuram", "Hosur", "Cuddalore", "Karur", "Namakkal", "Kumbakonam", "Sivakasi"] },
  { state: "Telangana", cities: ["All", "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Mancherial"] },
  { state: "Tripura", cities: ["All", "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Ambassa", "Belonia", "Khowai"] },
  { state: "Uttar Pradesh", cities: ["All", "Lucknow", "Noida", "Ghaziabad", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Firozabad", "Jhansi", "Mathura", "Ayodhya", "Muzaffarnagar", "Rampur", "Shahjahanpur", "Etawah", "Hapur", "Bulandshahr", "Mirzapur", "Basti", "Sitapur", "Farrukhabad"] },
  { state: "Uttarakhand", cities: ["All", "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Nainital", "Roorkee", "Rudrapur", "Kashipur", "Almora", "Pithoragarh", "Mussoorie", "Kotdwar", "Srinagar", "Chamoli"] },
  { state: "West Bengal", cities: ["All", "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling", "Kharagpur", "Haldia", "Malda", "Bardhaman", "Berhampore", "Jalpaiguri", "Cooch Behar", "Raiganj", "Krishnanagar"] },

  // Union Territories
  { state: "Andaman and Nicobar Islands", cities: ["All", "Port Blair", "Diglipur", "Mayabunder", "Rangat", "Havelock Island", "Car Nicobar"] },
  { state: "Chandigarh", cities: ["Chandigarh"] },
  { state: "Dadra and Nagar Haveli and Daman and Diu", cities: ["All", "Daman", "Diu", "Silvassa", "Amli", "Dadra"] },
  { state: "Delhi", cities: ["All", "New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Vasant Kunj", "Karol Bagh", "Janakpuri", "Laxmi Nagar", "Pitampura", "Mayur Vihar", "Shahdara"] },
  { state: "Jammu and Kashmir", cities: ["All", "Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Rajouri", "Kupwara", "Pulwama", "Sopore", "Kishtwar", "Doda", "Poonch"] },
  { state: "Ladakh", cities: ["All", "Leh", "Kargil", "Diskit", "Nubra", "Padum"] },
  { state: "Lakshadweep", cities: ["All", "Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni", "Kadmat", "Kiltan", "Chetlat", "Bitra"] },
  { state: "Puducherry", cities: ["All", "Puducherry", "Karaikal", "Mahe", "Yanam"] },
];