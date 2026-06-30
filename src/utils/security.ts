// Pure TypeScript SHA-256 implementation for secure password hashing in the front-end simulation
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const lengthProperty = 'length';
  let i, j; // Used as a counter across the whole file
  let result = '';

  const words: number[] = [];
  const asciiLength = ascii[lengthProperty] * 8;
  
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let primeCounter = 0;
  const isPrime: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isPrime[i] = true;
      }
      primeCounter++;
    }
  }

  const asciiBytes: number[] = [];
  for (i = 0; i < ascii[lengthProperty]; i++) {
    asciiBytes.push(ascii.charCodeAt(i));
  }
  asciiBytes.push(0x80);
  while (asciiBytes[lengthProperty] % 64 !== 56) {
    asciiBytes.push(0);
  }
  for (i = 0; i < 8; i++) {
    asciiBytes.push((asciiLength >>> (24 - i * 8)) & 0xff);
  }

  for (i = 0; i < asciiBytes[lengthProperty]; i += 4) {
    words.push(
      (asciiBytes[i] << 24) |
      (asciiBytes[i + 1] << 16) |
      (asciiBytes[i + 2] << 8) |
      asciiBytes[i + 3]
    );
  }

  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const w15 = w[j - 15];
        const w2 = w[j - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const a = hash[0];
      const e = hash[4];
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      
      const temp1 = (hash[7] + s1 + ch + k[j] + (w[j] || 0)) | 0;
      const temp2 = (s0 + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.length = 8;
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    const value = hash[i];
    result += ((value >>> 24) & 0xff).toString(16).padStart(2, '0');
    result += ((value >>> 16) & 0xff).toString(16).padStart(2, '0');
    result += ((value >>> 8) & 0xff).toString(16).padStart(2, '0');
    result += (value & 0xff).toString(16).padStart(2, '0');
  }

  return result;
}

export function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Guarantee at least one of each and total length 12
  const parts = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ];
  
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    parts.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle
  return parts.sort(() => Math.random() - 0.5).join('');
}

export function validatePasswordStrength(password: string): {
  strength: 'Weak' | 'Medium' | 'Strong';
  score: number; // 0 to 5
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Must be at least 8 characters long');
  }
  
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one uppercase letter');
  }
  
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one lowercase letter');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }
  
  if (/[!@#$%^&*()_+\-=\[\]{}|;:',\.<>?]/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one special character');
  }
  
  let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score >= 5) {
    strength = 'Strong';
  } else if (score >= 3) {
    strength = 'Medium';
  }
  
  return { strength, score, feedback };
}
