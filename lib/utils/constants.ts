// Travel Helper v2.0 - Constants

// 카테고리 정의
export type Category = 'food' | 'transport' | 'shopping' | 'lodging' | 'activity' | 'etc';

export const CATEGORIES: { id: Category; label: string; icon: string; lightColor: string; darkColor: string }[] = [
  { id: 'food', label: '식비', icon: 'restaurant', lightColor: '#FF6B6B', darkColor: '#FF8787' },
  { id: 'transport', label: '교통', icon: 'directions-bus', lightColor: '#4DABF7', darkColor: '#74C0FC' },
  { id: 'shopping', label: '쇼핑', icon: 'shopping-bag', lightColor: '#A78BFA', darkColor: '#B197FC' },
  { id: 'lodging', label: '숙박', icon: 'hotel', lightColor: '#FF922B', darkColor: '#FFA94D' },
  { id: 'activity', label: '관광', icon: 'local-activity', lightColor: '#20C997', darkColor: '#38D9A9' },
  { id: 'etc', label: '기타', icon: 'more-horiz', lightColor: '#6B7684', darkColor: '#8B949E' },
];

// 결제 방식
export type PaymentMethod = 'wallet' | 'card' | 'cash';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; description: string }[] = [
  { id: 'wallet', label: '지갑', icon: 'account-balance-wallet', description: '환전한 현금 지갑에서 차감' },
  { id: 'card', label: '카드', icon: 'credit-card', description: '신용/체크카드 결제' },
  { id: 'cash', label: '현금', icon: 'payments', description: '현금 직접 결제 (지갑 미반영)' },
];

// 지원 통화 (확장)
export const CURRENCIES: { code: string; symbol: string; name: string; flag: string; country: string }[] = [
  { code: 'JPY', symbol: '¥', name: '일본 엔', flag: '🇯🇵', country: '일본' },
  { code: 'USD', symbol: '$', name: '미국 달러', flag: '🇺🇸', country: '미국' },
  { code: 'EUR', symbol: '€', name: '유로', flag: '🇪🇺', country: '유럽' },
  { code: 'GBP', symbol: '£', name: '영국 파운드', flag: '🇬🇧', country: '영국' },
  { code: 'CNY', symbol: '¥', name: '중국 위안', flag: '🇨🇳', country: '중국' },
  { code: 'THB', symbol: '฿', name: '태국 바트', flag: '🇹🇭', country: '태국' },
  { code: 'VND', symbol: '₫', name: '베트남 동', flag: '🇻🇳', country: '베트남' },
  { code: 'TWD', symbol: 'NT$', name: '대만 달러', flag: '🇹🇼', country: '대만' },
  { code: 'PHP', symbol: '₱', name: '필리핀 페소', flag: '🇵🇭', country: '필리핀' },
  { code: 'SGD', symbol: 'S$', name: '싱가포르 달러', flag: '🇸🇬', country: '싱가포르' },
  { code: 'AUD', symbol: 'A$', name: '호주 달러', flag: '🇦🇺', country: '호주' },
  { code: 'CAD', symbol: 'C$', name: '캐나다 달러', flag: '🇨🇦', country: '캐나다' },
  { code: 'CHF', symbol: 'CHF', name: '스위스 프랑', flag: '🇨🇭', country: '스위스' },
  { code: 'CZK', symbol: 'Kč', name: '체코 코루나', flag: '🇨🇿', country: '체코' },
  { code: 'HKD', symbol: 'HK$', name: '홍콩 달러', flag: '🇭🇰', country: '홍콩' },
  { code: 'MYR', symbol: 'RM', name: '말레이시아 링깃', flag: '🇲🇾', country: '말레이시아' },
  { code: 'NZD', symbol: 'NZ$', name: '뉴질랜드 달러', flag: '🇳🇿', country: '뉴질랜드' },
  { code: 'IDR', symbol: 'Rp', name: '인도네시아 루피아', flag: '🇮🇩', country: '인도네시아' },
];

// 자주 가는 국가 (방문지 추가 시)
export const POPULAR_COUNTRIES: { country: string; flag: string; currency: string }[] = [
  { country: '일본', flag: '🇯🇵', currency: 'JPY' },
  { country: '미국', flag: '🇺🇸', currency: 'USD' },
  { country: '프랑스', flag: '🇫🇷', currency: 'EUR' },
  { country: '영국', flag: '🇬🇧', currency: 'GBP' },
  { country: '독일', flag: '🇩🇪', currency: 'EUR' },
  { country: '이탈리아', flag: '🇮🇹', currency: 'EUR' },
  { country: '스페인', flag: '🇪🇸', currency: 'EUR' },
  { country: '태국', flag: '🇹🇭', currency: 'THB' },
];

// 통화 코드로 정보 찾기
export function getCurrencyInfo(code: string) {
  return CURRENCIES.find(c => c.code === code);
}

// 카테고리 정보 찾기
export function getCategoryInfo(id: Category) {
  return CATEGORIES.find(c => c.id === id);
}

// 지갑 거래 타입
export type WalletTransactionType = 'deposit' | 'withdraw' | 'adjust';
