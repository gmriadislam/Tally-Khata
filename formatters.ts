// Bengali digit mappings
const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  if (num === undefined || num === null) return '০';
  const str = num.toString();
  return str.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
}

export function normalizeDigits(str: string): string {
  if (!str) return '';
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
}

export function formatTaka(amount: number, useBengaliDigits: boolean = false): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  const displayAmount = useBengaliDigits ? toBengaliNumber(formatted) : formatted;
  const sign = amount < 0 ? '-' : '';
  return `${sign}৳ ${displayAmount}`;
}

export function formatNumber(num: number, useBengaliDigits: boolean = false): string {
  const formatted = num.toLocaleString('en-IN');
  return useBengaliDigits ? toBengaliNumber(formatted) : formatted;
}

const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BENGALI_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

export function formatBengaliDate(dateString: string, includeTime: boolean = false): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const dayName = BENGALI_DAYS[d.getDay()];
    const dateNum = d.getDate();
    const month = BENGALI_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    let result = `${dateNum} ${month}, ${year} (${dayName})`;

    if (includeTime) {
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'দুপুর/রাত' : 'সকাল';
      const displayHours = hours % 12 || 12;
      result += ` - ${period} ${displayHours}:${minutes}`;
    }

    return result;
  } catch {
    return dateString;
  }
}

export function getRelativeBengaliDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'আজ';
    if (isYesterday) return 'গতকাল';
    
    return `${d.getDate()} ${BENGALI_MONTHS[d.getMonth()]}`;
  } catch {
    return dateString;
  }
}

// Generate reminder message for Customer due
export function generateReminderText(
  shopName: string,
  customerName: string,
  dueAmount: number,
  phone?: string
): string {
  return `শ্রদ্ধেয় ${customerName},\n"${shopName}"-এ আপনার পূর্বের বাকি রয়েছে ৳${Math.abs(dueAmount).toLocaleString('en-IN')} টাকা। বকেয়া পরিশোধ করার জন্য বিনীত অনুরোধ করা হচ্ছে।\nধন্যবাদান্তে,\n${shopName}`;
}

export function getWhatsAppShareUrl(phone: string, text: string): string {
  // Clean phone number (e.g. 017xxxxxxxx -> +88017xxxxxxxx)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '88' + cleanPhone;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function isPersonalAccount(biz?: any): boolean {
  if (!biz) return false;
  if (biz.accountCategory === 'personal') return true;
  const bType = (biz.businessType || biz.category || biz.name || '').toLowerCase();
  return (
    bType.includes('ব্যক্তিগত') ||
    bType.includes('personal') ||
    bType.includes('পারিবারিক') ||
    bType.includes('সংসার') ||
    bType.includes('মেস') ||
    bType.includes('ধার-দেনা')
  );
}

