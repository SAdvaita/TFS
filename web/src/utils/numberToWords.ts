const ones = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertLessThanOneThousand(n: number): string {
  let result = '';

  if (n >= 100) {
    result += ones[Math.floor(n / 100)] + ' HUNDRED ';
    n %= 100;
  }

  if (n >= 20) {
    result += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }

  if (n > 0) {
    result += ones[n] + ' ';
  }

  return result.trim();
}

export function amountInWordsIndian(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return 'ZERO ONLY';

  let num = rounded;
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore > 0) {
    words += convertLessThanOneThousand(crore) + ' CRORE ';
  }

  if (lakh > 0) {
    words += convertLessThanOneThousand(lakh) + ' LAKH ';
  }

  if (thousand > 0) {
    words += convertLessThanOneThousand(thousand) + ' THOUSAND ';
  }

  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder);
  }

  return `${words.trim()} ONLY`;
}
