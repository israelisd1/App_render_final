/**
 * Valida telefone celular brasileiro com DDD
 * @param phone - Telefone com ou sem formatação ((##) #####-#### ou ###########)
 * @returns true se telefone é válido, false caso contrário
 */
export function validatePhone(phone: string): boolean {
  // Remove formatação (parênteses, espaços, hífen)
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos (DDD + 9 dígitos)
  if (cleanPhone.length !== 11) {
    return false;
  }

  // Extrai DDD (2 primeiros dígitos)
  const ddd = parseInt(cleanPhone.substring(0, 2));

  // Valida DDD (11-99, exceto alguns inválidos)
  const validDDDs = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, // RJ
    27, 28, // ES
    31, 32, 33, 34, 35, 37, 38, // MG
    41, 42, 43, 44, 45, 46, // PR
    47, 48, 49, // SC
    51, 53, 54, 55, // RS
    61, // DF
    62, 64, // GO
    63, // TO
    65, 66, // MT
    67, // MS
    68, // AC
    69, // RO
    71, 73, 74, 75, 77, // BA
    79, // SE
    81, 87, // PE
    82, // AL
    83, // PB
    84, // RN
    85, 88, // CE
    86, 89, // PI
    91, 93, 94, // PA
    92, 97, // AM
    95, // RR
    96, // AP
    98, 99, // MA
  ];

  if (!validDDDs.includes(ddd)) {
    return false;
  }

  // Verifica se o terceiro dígito é 9 (celular)
  const thirdDigit = cleanPhone.charAt(2);
  if (thirdDigit !== '9') {
    return false;
  }

  // Verifica se não é número sequencial (ex: 11 99999-9999)
  if (/^(\d)\1{10}$/.test(cleanPhone)) {
    return false;
  }

  return true;
}

/**
 * Remove formatação do telefone, deixando apenas números
 * @param phone - Telefone com ou sem formatação
 * @returns Telefone apenas com números
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

