import { sendEmail } from './server/auth/emailService';

async function testEmail() {
  console.log('[Test] Testando envio de email...');
  console.log('[Test] EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('[Test] EMAIL_USER:', process.env.EMAIL_USER);
  console.log('[Test] EMAIL_FROM:', process.env.EMAIL_FROM);

  const result = await sendEmail({
    to: 'israelisd@gmail.com',
    subject: 'Teste de Email - Architecture Rendering App',
    html: '<h1>Teste</h1><p>Este é um email de teste.</p>',
    text: 'Teste - Este é um email de teste.'
  });

  console.log('[Test] Resultado:', result ? 'SUCESSO ✅' : 'FALHA ❌');
}

testEmail().catch(console.error);
