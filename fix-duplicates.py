#!/usr/bin/env python3
"""Remove routers duplicados de coupons e promotionCodes"""

with open('server/routers.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar as linhas onde começam os routers duplicados (segundo conjunto)
start_line = None
end_line = None

for i, line in enumerate(lines):
    # Procurar o segundo "coupons: router(" (linha ~1193)
    if 'coupons: router({' in line and start_line is None:
        # Pular o primeiro
        continue
    elif 'coupons: router({' in line and start_line is None:
        start_line = i - 3  # Incluir comentário acima
    
    # Procurar o fechamento do segundo promotionCodes router (linha ~1495)
    if start_line is not None and line.strip() == '}),':
        # Verificar se a próxima linha é '});' (fechamento do admin router)
        if i + 1 < len(lines) and lines[i + 1].strip() == '});':
            end_line = i + 1
            break

if start_line and end_line:
    print(f"Removendo linhas {start_line + 1} a {end_line + 1}")
    # Remover as linhas duplicadas
    new_lines = lines[:start_line] + lines[end_line + 1:]
    
    with open('server/routers.ts', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("✅ Routers duplicados removidos com sucesso!")
else:
    print("❌ Não foi possível encontrar os routers duplicados")
    print(f"start_line: {start_line}, end_line: {end_line}")
