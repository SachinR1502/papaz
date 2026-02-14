
export interface BrandData {
    name: string;
    domain: string;
    models: string[];
}

export const VEHICLE_DATA: Record<string, BrandData[]> = {

    'Car': [
        // Passenger Vehicles
        { name: 'Maruti Suzuki', domain: 'marutisuzuki.com', models: ['Swift', 'Baleno', 'Dzire', 'Wagon R', 'Alto K10', 'Brezza', 'Ertiga', 'Grand Vitara', 'Fronx', 'Jimny', 'Celerio', 'S-Presso', 'Ignis', 'XL6', 'Invicto', 'Ciaz'] },
        { name: 'Tata', domain: 'tatamotors.com', models: ['Nexon', 'Punch', 'Harrier', 'Safari', 'Tiago', 'Tigor', 'Altroz', 'Curvv', 'Nexon EV', 'Tiago EV', 'Punch EV', 'Tigor EV'] },
        { name: 'Hyundai', domain: 'hyundai.com', models: ['Creta', 'Venue', 'i20', 'Grand i10 Nios', 'Verna', 'Tucson', 'Alcazar', 'Exter', 'Aura', 'Ioniq 5', 'Kona Electric'] },
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Scorpio-N', 'Scorpio Classic', 'XUV700', 'Thar', 'Bolero', 'Bolero Neo', 'XUV300', 'XUV400', 'Marazzo', 'XUV 3XO', 'XUV 400 EV'] },
        { name: 'Toyota', domain: 'toyota.com', models: ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Glanza', 'Urban Cruiser Hyryder', 'Hilux', 'Vellfire', 'Rumion', 'Camry', 'Land Cruiser 300'] },
        { name: 'Kia', domain: 'kia.com', models: ['Seltos', 'Sonet', 'Carens', 'Carnival', 'EV6', 'EV9'] },
        { name: 'Honda', domain: 'honda.com', models: ['City', 'Amaze', 'Elevate', 'City Hybrid'] },
        { name: 'MG', domain: 'mgmotor.co.in', models: ['Hector', 'Hector Plus', 'Astor', 'Comet EV', 'ZS EV', 'Gloster'] },
        { name: 'Renault', domain: 'renault.co.in', models: ['Kwid', 'Triber', 'Kiger'] },
        { name: 'Volkswagen', domain: 'volkswagen.co.in', models: ['Virtus', 'Taigun', 'Tiguan'] },
        { name: 'Skoda', domain: 'https://www.skoda-auto.co.in/', models: ['Slavia', 'Kushaq', 'Kodiaq', 'Superb'] },
        { name: 'Nissan', domain: 'nissan.in', models: ['Magnite', 'X-Trail'] },
        { name: 'Jeep', domain: 'jeep-india.com', models: ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee'] },
        { name: 'Citroen', domain: 'citroen.in', models: ['C3', 'eC3', 'C3 Aircross', 'C5 Aircross'] },
        { name: 'Force', domain: 'forcemotors.com', models: ['Gurkha'] },
        { name: 'Isuzu', domain: 'isuzu.in', models: ['V-Cross', 'MU-X', 'Hi-Lander'] },
        { name: 'BYD', domain: 'bydautoindia.com', models: ['Atto 3', 'e6', 'Seal'] },
        // Luxury & Performance
        { name: 'Mercedes-Benz', domain: 'mercedes-benz.co.in', models: ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQS', 'Maybach'] },
        { name: 'BMW', domain: 'bmw.in', models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'iX1', 'i7', 'M4', 'M5'] },
        { name: 'Audi', domain: 'audi.in', models: ['A4', 'A6', 'A8 L', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'Q3 Sportback'] },
        { name: 'Land Rover', domain: 'landrover.in', models: ['Range Rover', 'Defender', 'Discovery', 'Velar', 'Evoque', 'Range Rover Sport'] },
        { name: 'Jaguar', domain: 'jaguar.in', models: ['F-Pace', 'I-Pace', 'F-Type'] },
        { name: 'Volvo', domain: 'volvocars.com', models: ['XC40 Recharge', 'XC60', 'XC90', 'C40 Recharge'] },
        { name: 'Porsche', domain: 'porsche.com', models: ['Macan', 'Cayenne', '911', 'Taycan', 'Panamera'] },
        { name: 'Lamborghini', domain: 'lamborghini.com', models: ['Urus', 'Huracan', 'Revuelto'] },
        { name: 'Ferrari', domain: 'ferrari.com', models: ['Roma', '296 GTB', 'Purosangue'] },
        { name: 'Maserati', domain: 'maserati.com', models: ['Levante', 'Ghibli', 'Grecale'] },
        { name: 'Rolls-Royce', domain: 'rolls-roycemotorcars.com', models: ['Phantom', 'Cullinan', 'Ghost'] },
        { name: 'Bentley', domain: 'bentleymotors.com', models: ['Bentayga', 'Continental GT', 'Flying Spur'] },
        { name: 'Mini', domain: 'mini.in', models: ['Cooper', 'Countryman'] },
        { name: 'Lexus', domain: 'lexusindia.co.in', models: ['ES', 'NX', 'RX', 'LX', 'LM'] }
    ],
    'Bike': [
        { name: 'Hero', domain: 'heromotocorp.com', models: ['Splendor+', 'HF Deluxe', 'Passion+', 'Glamour', 'Super Splendor', 'Xpulse 200 4V', 'Xtheme 160R 4V', 'Karizma XMR', 'Mavrick 440'] },
        { name: 'Bajaj', domain: 'bajajauto.com', models: ['Pulsar 150', 'Pulsar N160', 'Pulsar NS200', 'Pulsar RS200', 'Platina 100', 'Platina 110', 'CT 110X', 'Dominar 400', 'Dominar 250', 'Avenger Cruise 220', 'Freedom 125'] },
        { name: 'Honda', domain: 'honda2wheelersindia.com', models: ['Shine 125', 'SP 125', 'Unicorn', 'Hornet 2.0', 'CB200X', 'CB350 H\'ness', 'CB350RS', 'CD 110 Dream', 'SP 160', 'CB300R', 'NX500'] },
        { name: 'Royal Enfield', domain: 'royalenfield.com', models: ['Classic 350', 'Bullet 350', 'Meteor 350', 'Hunter 350', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650', 'Shotgun 650'] },
        { name: 'TVS', domain: 'tvsmotor.com', models: ['Apache RTR 160', 'Apache RTR 160 4V', 'Apache RR 310', 'Raider 125', 'Sport', 'Radeon', 'Star City+', 'Ronin'] },
        { name: 'Yamaha', domain: 'yamaha-motor-india.com', models: ['MT-15 V2', 'R15 V4', 'R15M', 'FZ-S FI V4', 'FZ-X', 'R3', 'MT-03'] },
        { name: 'KTM', domain: 'ktm.com', models: ['Duke 200', 'Duke 250', 'Duke 390', 'RC 200', 'RC 390', 'Adventure 390', 'Adventure 250'] },
        { name: 'Suzuki', domain: 'suzukimotorcycle.co.in', models: ['Gixxer', 'Gixxer SF', 'Gixxer 250', 'V-Strom SX', 'Hayabusa'] },
        { name: 'Jawa Yezdi', domain: 'jawayezdimotorcycles.com', models: ['Jawa 350', 'Jawa 42', 'Jawa 42 Bobber', 'Yezdi Roadster', 'Yezdi Scrambler', 'Yezdi Adventure'] },
        { name: 'Triumph', domain: 'triumphmotorcycles.in', models: ['Speed 400', 'Scrambler 400 X', 'Street Triple'] },
        { name: 'Kawasaki', domain: 'kawasaki-india.com', models: ['Ninja 300', 'Ninja 500', 'Ninja ZX-10R', 'Z900'] },
        { name: 'Harley-Davidson', domain: 'harley-davidson.com', models: ['X440', 'Fat Boy'] },
        { name: 'Benelli', domain: 'india.benelli.com', models: ['Imperiale 400', 'TRK 502', '502C'] },
        { name: 'Ducati', domain: 'ducati.com', models: ['Monster', 'Panigale', 'Multistrada', 'Scrambler'] },
        { name: 'BMW Motorrad', domain: 'bmw-motorrad.in', models: ['G 310 R', 'G 310 RR', 'G 310 GS', 'S 1000 RR', 'R 1250 GS'] },
        { name: 'Aprilia', domain: 'apriliaindia.com', models: ['RS 457', 'RSV4', 'Tuono 660'] },
        { name: 'Revolt', domain: 'revoltmotors.com', models: ['RV400', 'RV400 BRZ'] },
        { name: 'Ultraviolette', domain: 'ultraviolette.com', models: ['F77 Mach 2'] },
        { name: 'Husqvarna', domain: 'husqvarna-motorcycles.com', models: ['Vitpilen 250', 'Svartpilen 401'] }
    ],
    'Scooter': [
        { name: 'Honda', domain: 'honda2wheelersindia.com', models: ['Activa 6G', 'Activa 125', 'Dio', 'Dio 125', 'Grazia'] },
        { name: 'TVS', domain: 'tvsmotor.com', models: ['Jupiter 110', 'Jupiter 125', 'Ntorq 125', 'Zest 110', 'iQube', 'X EV'] },
        { name: 'Suzuki', domain: 'suzukimotorcycle.co.in', models: ['Access 125', 'Burgman Street', 'Avenis'] },
        { name: 'Ola Electric', domain: 'olaelectric.com', models: ['S1 Pro', 'S1 Air', 'S1 X', 'S1 X+'] },
        { name: 'Ather', domain: 'atherenergy.com', models: ['450X', '450S', 'Rizta'] },
        { name: 'Bajaj', domain: 'bajajauto.com', models: ['Chetak Premium', 'Chetak Urbane'] },
        { name: 'Hero', domain: 'heromotocorp.com', models: ['Pleasure+', 'Destini 125', 'Xoom', 'Maestro Edge 125', 'Vida V1'] },
        { name: 'Yamaha', domain: 'yamaha-motor-india.com', models: ['RayZR 125 Fi', 'Fascino 125 Fi', 'Aerox 155'] },
        { name: 'Vespa', domain: 'vespa.co.in', models: ['VXL 125', 'SXL 125', 'ZX 125', 'Elettrica'] },
        { name: 'Aprilia', domain: 'apriliaindia.com', models: ['SR 160', 'SR 125', 'SXR 160', 'SXR 125'] },
        { name: 'Hero Electric', domain: 'heroelectric.in', models: ['Optima', 'NYX', 'Atria'] },
        { name: 'Okinawa', domain: 'okinawascooters.com', models: ['Praise Pro', 'Ridge+', 'Okhi 90'] },
        { name: 'Ampere', domain: 'amperevehicles.com', models: ['Magnus EX', 'Primus'] },
        { name: 'BGauss', domain: 'bgauss.com', models: ['C12i', 'D15'] },
        { name: 'Pure EV', domain: 'pureev.in', models: ['ePluto 7G', 'Etrance Neo'] }
    ],
    'Truck': [
        { name: 'Tata Motors', domain: 'tatamotors.com', models: ['Ace Gold', 'Intra', 'Yodha', 'Signa', 'Prima', 'Ultra', 'LPT'] },
        { name: 'Ashok Leyland', domain: 'ashokleyland.com', models: ['Dost+', 'Bada Dost', 'Ecomet', 'Boss', 'Captain', 'Partner'] },
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Bolero Pickup', 'Bolero Maxx', 'Supro', 'Jeeto', 'Blazo X', 'Furio'] },
        { name: 'Eicher', domain: 'https://www.eichertrucksandbuses.com/', models: ['Pro 2000', 'Pro 3000', 'Pro 6000', 'Pro 8000'] },
        { name: 'BharatBenz', domain: 'bharatbenz.com', models: ['1015R', '1217C', '1617R', '2823C', '3528C'] },
        { name: 'SML Isuzu', domain: 'smlmahindra.com', models: ['Samrat GS', 'Sartaj GS', 'Prestige', 'Supreme'] },
        { name: 'Volvo Trucks', domain: 'volvotrucks.in', models: ['FH 540', 'FM 420', 'FMX 460'] },
        { name: 'MAN', domain: 'mantruckandbus.com', models: ['CLA 16.220', 'CLA 25.280'] },
        { name: 'Scania', domain: 'scania.com', models: ['G-Series', 'R-Series', 'P-Series'] }
    ],
    'Bus': [
        { name: 'Tata Motors', domain: 'tatamotors.com', models: ['Starbus', 'Cityride', 'Winger', 'Magna', 'Ultra'] },
        { name: 'Ashok Leyland', domain: 'ashokleyland.com', models: ['Viking', 'Cheetah', 'Sunshine', 'Lynx', 'Oyster'] },
        { name: 'Volvo', domain: 'volvobuses.com', models: ['9400', '9600', 'B11R', 'B8R'] },
        { name: 'BharatBenz', domain: 'bharatbenz.com', models: ['Glider', '1017 chassis', '1624 chassis'] },
        { name: 'Force', domain: 'forcemotors.com', models: ['Traveller', 'Trax Cruiser', 'Urbania'] },
        { name: 'SML Isuzu', domain: 'smlmahindra.com', models: ['S7 Staff', 'S7 School', 'Executive'] },
        { name: 'Olectra', domain: 'olectra.com', models: ['K9', 'K7', 'K6'] },
        { name: 'JBM', domain: 'jbmgroup.com', models: ['Ecolife Electric', 'Citylife'] },
        { name: 'Mercedes-Benz', domain: 'https://www.mercedes-benz-bus.com/int/en/home.html', models: ['SHD 24'] },
        { name: 'Scania', domain: 'scania.com', models: ['Metrolink'] }
    ],
    'Tractor': [
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Arjun Novo', 'Jivo', 'Yuvo Tech+', 'XP Plus', 'Oja'] },
        { name: 'Swaraj', domain: 'swarajtractors.com', models: ['744 FE', '735 FE', '855 FE', '963 FE', 'Target 630'] },
        { name: 'Sonalika', domain: 'sonalika.com', models: ['DI 35', 'DI 745', 'Tiger 55', 'Sikander'] },
        { name: 'John Deere', domain: 'deere.co.in', models: ['5310', '5050 D', '5105', '5405', '5075E'] },
        { name: 'New Holland', domain: 'newholland.com', models: ['3630 TX', '3230 TX', '5620 TX'] },
        { name: 'Eicher', domain: 'eichertractors.in', models: ['380', '485', '551', '242'] },
        { name: 'Massey Ferguson', domain: 'tafe.com', models: ['1035 DI', '241 DI', '7250', '9500'] },
        { name: 'Farmtrac', domain: 'http://farmtrac.pl/', models: ['60 Powermaxx', '45 Classic', 'Atom 26'] },
        { name: 'Powertrac', domain: 'escortsagri.com', models: ['Euro 50', 'Euro 439', '434 DS'] },
        { name: 'Kubota', domain: 'https://www.kubota.com/', models: ['MU4501', 'L4508', 'MU5501'] },
        { name: 'VST Shakti', domain: 'vsttractors.com', models: ['Mt 171', 'Mt 270', '932'] },
        { name: 'Preet', domain: 'preet.co', models: ['6049', '955'] },
        { name: 'ACE', domain: 'ace-cranes.com', models: ['DI 6500', 'DI 7500'] },
        { name: 'Solis', domain: 'https://solisworld.com/', models: ['Solis 5015', 'Solis 4415'] },
        { name: 'Digitrac', domain: 'https://digitracblog.wordpress.com/', models: ['PP 43i', 'PP 51i'] },
        { name: 'Indo Farm', domain: 'indofarm.in', models: ['3048 DI', '3055 DI'] },
        { name: 'Captain', domain: 'captaintractors.com', models: ['200 DI', '280 DI'] }
    ],
    'Van': [
        { name: 'Maruti Suzuki', domain: 'marutisuzuki.com', models: ['Eeco'] },
        { name: 'Tata Motors', domain: 'tatamotors.com', models: ['Magic Express', 'Winger', 'Ace Magic'] },
        { name: 'Force', domain: 'forcemotors.com', models: ['Traveller', 'Trax Toofan', 'Tripper'] },
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Supro Van', 'Supro Mini Van'] }
    ],
    'Rickshaw': [
        { name: 'Bajaj', domain: 'bajajauto.com', models: ['RE Compact', 'Maxima C', 'Maxima Z'] },
        { name: 'Piaggio', domain: 'piaggio-cv.co.in', models: ['Ape City', 'Ape Xtra', 'Ape DX'] },
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Alfa', 'Treo'] },
        { name: 'TVS', domain: 'tvsmotor.com', models: ['King Deluxe'] },
        { name: 'Atul', domain: 'atulauto.co.in', models: ['Gem', 'Gemini', 'Shakti'] }
    ],
    'Earthmover': [
        { name: 'JCB', domain: 'jcb.com', models: ['3DX', '4DX', 'JS205', 'NXT 140'] },
        { name: 'Tata Hitachi', domain: 'tatahitachi.co.in', models: ['EX 200LC', 'Shinrai', 'Zaxis'] },
        { name: 'Komatsu', domain: 'komatsuindia.in', models: ['PC210', 'PC130', 'PC71'] },
        { name: 'Caterpillar', domain: 'caterpillar.com', models: ['320D3', '424', '320GC'] },
        { name: 'Sany', domain: 'sany.in', models: ['SY210C', 'SY80C', 'SY140C'] },
        { name: 'Volvo CE', domain: 'volvoce.com', models: ['EC210D', 'EC200D', 'EC300D'] },
        { name: 'Hyundai CE', domain: 'hyundai-ce.com', models: ['R210', 'R215'] },
        { name: 'Kobelco', domain: 'kobelco-in.com', models: ['SK220', 'SK380'] },
        { name: 'Bobcat', domain: 'bobcat.com', models: ['S450', 'S770', 'E27'] },
        { name: 'Doosan', domain: 'doosan.com', models: ['DX225LCA', 'DX27z'] },
        { name: 'Case', domain: 'casece.com', models: ['770 EX', '1110 EX'] },
        { name: 'LiuGong', domain: 'https://www.liugong.com/', models: ['920E', '922E'] }
    ],
    'EV Vehicle': [
        { name: 'Tata Motors', domain: 'tatamotors.com', models: ['Magic Express', 'Winger', 'Ace Magic'] },
        { name: 'Force', domain: 'forcemotors.com', models: ['Traveller', 'Trax Toofan', 'Tripper'] },
        { name: 'Mahindra', domain: 'mahindra.com', models: ['Supro Van', 'Supro Mini Van'] }
    ],

};

// Flattened structure for backward compatibility with simple lists if needed (though we should migrate)
export const VEHICLE_BRANDS: Record<string, { name: string; domain: string }[]> = (() => {
    const brands: Record<string, { name: string; domain: string }[]> = {};
    for (const type in VEHICLE_DATA) {
        brands[type] = VEHICLE_DATA[type].map(b => ({ name: b.name, domain: b.domain }));
    }
    return brands;
})();

export const getBrandDomain = (brandName: string) => {
    for (const type in VEHICLE_DATA) {
        const brand = VEHICLE_DATA[type].find(b => b.name.toLowerCase() === brandName.toLowerCase());
        if (brand) return brand.domain;
    }
    return brandName.toLowerCase().replace(/\s+/g, '') + '.com'; // Fallback
};
