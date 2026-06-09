Prompt para Criação do Sistema
Contexto e Objetivo: Aja como um Arquiteto de Software e Desenvolvedor Full Stack. Projete um sistema web de Gestão Inteligente de Estoque para Autopeças focado em micro e pequenas empresas
. O objetivo principal é evitar rupturas de estoque (falta de peças) e o excesso de capital imobilizado, utilizando métodos matemáticos de otimização
.
1. Arquitetura e Tecnologias Sugeridas:
Arquitetura: Cliente-Servidor
.
Frontend: React ou HTML5/CSS3/JavaScript para uma interface responsiva e intuitiva
.
Backend: PHP ou Node.js para processamento de regras de negócio
.
Banco de Dados: Relacional (MySQL), com tabelas para: Usuários, Clientes, Fornecedores, Produtos, Categorias, Entradas, Saídas, Pedidos e Devoluções
.
2. Módulos e Funcionalidades Essenciais:
Gestão de Cadastro: Registro completo de peças, incluindo fabricante, categoria, preço de custo, preço de venda e compatibilidade com veículos (marca/modelo/ano)
.
Rastreamento e Identificação: Suporte a códigos de barras e QR Codes para agilizar entradas e saídas e reduzir erros manuais
.
Movimentação de Estoque: Registro em tempo real de entradas, saídas para a loja e devoluções
.
Dashboard de Indicadores: Visualização de itens mais vendidos, giro de estoque e alertas de reposição
.
3. Inteligência e Fórmulas de Otimização (Obrigatório): Implemente os seguintes cálculos automáticos para cada item de Classe A:
Classificação ABC: Agrupar itens onde a Classe A representa ~80% do valor monetário, Classe B ~15% e Classe C ~5%
.
Estoque de Segurança (ES): ES=DesvioPadr 
a
~
 odaDemanda×FatordeSeguran 
c
\c
​
 a
.
Lote Econômico de Compra (LEC): LEC= 
CustodeArmazenagem
2×Demanda×CustodePedido
​
 

​
 
.
Ponto de Ressuprimento (PP): PP=(ConsumoM 
e
ˊ
 dio×TempodeReposi 
c
\c
​
  
a
~
 o)+ES
.
Estoque Máximo (E 
max
​
 ): E 
max
​
 =ES+LEC
.
4. Regras de Negócio e UX:
Alertas de Nível Crítico: O sistema deve emitir notificações automáticas quando um produto atingir o Ponto de Ressuprimento
.
Segurança: Acesso apenas via login com senhas criptografadas e diferentes níveis de permissão (ex: gerente e operador)
.
Geração de Relatórios: Exportação de inventários cíclicos e estatísticas de vendas em PDF
.
Entregável Esperado:
Esboço do Diagrama Entidade-Relacionamento (DER).
Lógica em pseudocódigo (ou linguagem escolhida) para o cálculo automático do Ponto de Ressuprimento e LEC.
Protótipo das telas de Dashboard e Cadastro de Produtos com foco em usabilidade (UX Design)
.

--------------------------------------------------------------------------------
Por que este prompt é eficiente segundo as fontes?
Foco na Especialização: Fontes ressaltam que sistemas genéricos falham em autopeças por não considerarem a diversidade de códigos e a compatibilidade técnica
.
Cientificidade: A inclusão das fórmulas de LEC e Ponto de Pedido atende à necessidade identificada de substituir o controle "empírico" por um controle matemático que reduz custos operacionais
.
Metodologia de Desenvolvimento: O prompt segue o Modelo Incremental e a Engenharia de Software sugerida para garantir que o sistema seja funcional e escalável
.