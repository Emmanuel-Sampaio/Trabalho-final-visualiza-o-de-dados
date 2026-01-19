# 🎉 Projeto Atualizado - 30 Cidades

## Mudanças Implementadas

### ✅ Expansão de Dados

**ANTES:** 15 cidades | 16.440 registros
**AGORA:** 30 cidades | 32.880 registros

### 🌍 Novas Cidades Adicionadas (15 cidades)

#### Ásia (6 novas)
- Shanghai (China)
- Bangkok (Tailândia)
- Jakarta (Indonésia)
- Hong Kong
- Singapore
- Kolkata (Índia)

#### Europa (5 novas)
- Madrid (Espanha)
- Rome (Itália)
- Moscow (Rússia)
- Amsterdam (Holanda)
- Warsaw (Polônia)

#### América do Norte (2 novas)
- Chicago (EUA)
- Toronto (Canadá)

#### América do Sul (2 novas)
- Rio de Janeiro (Brasil)
- Buenos Aires (Argentina)

### 📊 Melhorias nas Visualizações

1. **Gráfico de Barras**: Agora mostra até 20 cidades (antes: 15)
2. **Série Temporal**: Exibe até 10 linhas simultaneamente (antes: 8)
3. **Mapa Interativo**: 30 marcadores com dados atualizados
4. **Calendário Heatmap**: Seleção entre todas as 30 cidades

### 🎨 Cobertura Geográfica Aprimorada

- **Ásia**: 11 cidades (73% dos dados globais de poluição)
- **Europa**: 8 cidades (diversidade de níveis de poluição)
- **América do Norte**: 5 cidades (incluindo megacidades)
- **América do Sul**: 3 cidades (principais centros urbanos)
- **África**: 2 cidades (representação continental)
- **Oceania**: 1 cidade (referência de baixa poluição)

### 📈 Dados Mais Representativos

#### Níveis de Poluição (PM2.5):
- **> 80 µg/m³**: 4 cidades (Delhi, Kolkata, Cairo, Beijing)
- **50-80 µg/m³**: 6 cidades (Mumbai, Shanghai, Lagos, Jakarta, Bangkok, Mexico City)
- **30-50 µg/m³**: 7 cidades (São Paulo, Seoul, Buenos Aires, etc.)
- **< 30 µg/m³**: 13 cidades (maioria europeia e algumas da América do Norte)

### 🔧 Alterações Técnicas

1. **collect_data.py**: 
   - Lista expandida de 15 para 30 cidades
   - Dados de poluição base para todas as novas cidades
   - Geração de 32.880 registros

2. **index.html**: 
   - Estatísticas atualizadas no hero
   - Descrição atualizada

3. **main.js**: 
   - Suporte para visualização de mais cidades
   - Paleta de cores expandida (30 cores)
   - Otimizações de performance

4. **README.md**: 
   - Lista completa de cidades
   - Insights detalhados por nível de poluição
   - Documentação atualizada

### 💾 Tamanho do Arquivo

**Arquivo ZIP:** 1.5 MB (dobro do anterior devido aos dados expandidos)

### ⚡ Performance

Mesmo com o dobro de dados, o site mantém:
- Carregamento rápido
- Interações suaves
- Filtros responsivos
- Visualizações fluidas

## Como Usar

Extraia o ZIP e execute:
```bash
cd qualidade-ar-projeto
python -m http.server 8000
```

Acesse: http://localhost:8000

---

**Nota**: Todos os dados são sintéticos e baseados em valores médios reais reportados pela OpenAQ e OMS. O projeto usa a mesma metodologia da API OpenAQ, mas com dados simulados para fins educacionais.
