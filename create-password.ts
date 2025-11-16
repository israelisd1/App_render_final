import bcrypt from 'bcryptjs';

async function createPassword() {
  const password = 'Arqrender@2025';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Senha criada:');
  console.log('Senha original:', password);
  console.log('Hash:', hashedPassword);
  
  return hashedPassword;
}

createPassword().catch(console.error);
