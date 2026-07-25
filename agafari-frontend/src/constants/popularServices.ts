import type { Service } from '../types/service';

export const POPULAR_SERVICES: Service[] = [
  {
    id: 'passport-renewal',
    name_en: 'Passport Renewal',
    name_am: 'ፓስፖርት እድሳት',
    category: 'identity',
    office_info: 'Immigration and Citizenship Service (ICS)',
    fee: '2,000 ETB',
    processing_time: '5–10 Days',
    tags: ['Passport', 'Travel', 'Urgent'],
    last_verified: '2024-10-24',
    steps: [
      {
        id: 's1', service_id: 'passport-renewal', order_num: 1,
        title_en: 'Online Application', title_am: 'የኦንላይን ማመልከቻ',
        desc_en: 'Fill out the digital form on the official ICS portal and choose your appointment slot.',
        desc_am: 'በኦፊሴላዊው የኢሚግሬሽን ፖርታል ላይ ዲጂታል ቅጹን ይሙሉ እና የቀጠሮ ጊዜዎን ይምረጡ።'
      },
      {
        id: 's2', service_id: 'passport-renewal', order_num: 2,
        title_en: 'Fee Payment', title_am: 'የክፍያ አፈፃፀም',
        desc_en: 'Complete the payment via Telebirr, CBE Birr, or Apollo. Keep your transaction ID ready.',
        desc_am: 'በቴሌብር፣ በሲቢኢ ብር ወይም አፖሎ በኩል ክፍያውን ያጠናቅቁ። የግብይት መታወቂያዎን ይያዙ።'
      },
      {
        id: 's3', service_id: 'passport-renewal', order_num: 3,
        title_en: 'Biometric Capture', title_am: 'የጣት አሻራ እና ፎቶ',
        desc_en: 'Visit the selected branch on your appointment date for fingerprints and photo.',
        desc_am: 'ለጣት አሻራ እና ፎቶ በቀጠሮ ቀንዎ የተመረጠውን ቅርንጫፍ ይጎብኙ።'
      }
    ],
    documents: [
      {
        id: 'd1', service_id: 'passport-renewal', is_mandatory: true,
        title_en: 'Current Passport', title_am: 'የአሁኑ ፓስፖርት',
        desc_en: 'Original and one clear photocopy of the information page.',
        desc_am: 'ዋናው እና አንድ ግልጽ የሆነ የመረጃ ገጽ ፎቶ ኮፒ።'
      },
      {
        id: 'd2', service_id: 'passport-renewal', is_mandatory: true,
        title_en: 'Kebele ID / National ID', title_am: 'የቀበሌ መታወቂያ / ብሔራዊ መታወቂያ',
        desc_en: 'Original valid ID card with a clear photocopy.',
        desc_am: 'ዋናው የታደሰ መታወቂያ ካርድ ከግልጽ ፎቶ ኮፒ ጋር።'
      },
      {
        id: 'd3', service_id: 'passport-renewal', is_mandatory: true,
        title_en: 'Payment Receipt', title_am: 'የክፍያ ደረሰኝ',
        desc_en: 'Digital or printed proof of payment.',
        desc_am: 'ዲጂታል ወይም የታተመ የክፍያ ማስረጃ።'
      },
      {
        id: 'd4', service_id: 'passport-renewal', is_mandatory: false,
        title_en: 'Marriage Certificate', title_am: 'የጋብቻ የምስክር ወረቀት',
        desc_en: 'Only if you are requesting a name change due to marriage.',
        desc_am: 'በጋብቻ ምክንያት የስም ለውጥ ከጠየቁ ብቻ።'
      }
    ]
  },
  {
    id: 'fayda-id',
    name_en: 'Fayda ID Registration',
    name_am: 'ፋይዳ መታወቂያ ምዝገባ',
    category: 'identity',
    office_info: 'National ID Program (NIDP)',
    fee: 'FREE',
    processing_time: 'Same Day',
    tags: ['ID', 'Fayda', 'Biometric'],
    last_verified: '2024-10-20',
    steps: [],
    documents: []
  },
  {
    id: 'business-reg',
    name_en: 'Business Registration',
    name_am: 'የንግድ ምዝገባ',
    category: 'business',
    office_info: 'Ministry of Trade and Regional Integration',
    fee: '2,000 ETB',
    processing_time: '3–7 Days',
    tags: ['Business', 'Trade', 'License'],
    last_verified: '2024-10-15',
    steps: [],
    documents: []
  },
  {
    id: 'driver-license-renewal',
    name_en: "Driver's License Renewal",
    name_am: 'መንጃ ፈቃድ እድሳት',
    category: 'transport',
    office_info: 'Federal Transport Authority',
    fee: '650 ETB',
    processing_time: '1 Day',
    tags: ['Driving', 'Transport', 'License'],
    last_verified: '2024-10-18',
    steps: [],
    documents: []
  }
];
