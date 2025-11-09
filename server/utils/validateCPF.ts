/**
 * Valida CPF brasileiro
 * @param cpf - CPF com ou sem formatação (###.###.###-## ou ###########)
 * @returns true se CPF é válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  // Remove formatação (pontos, hífen, espaços)
  const cleanCPF = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Remove formatação do CPF, deixando apenas números
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

