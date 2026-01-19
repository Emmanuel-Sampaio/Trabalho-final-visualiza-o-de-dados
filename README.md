# Visualização Interativa da Qualidade do Ar

![Status](https://img.shields.io/badge/status-completo-success)
![Visualização de Dados](https://img.shields.io/badge/projeto-visualização--de--dados-blue)

## 📊 Sobre o Projeto
**Site do projeto** : [Visualização de Níveis de poluentes do ar em grandes cidades mundiais](https://emmanuel-sampaio.github.io/Trabalho-final-visualiza-o-de-dados/)

Projeto final da disciplina de Visualização de Dados desenvolvido por **Emmanuel Lima Sampaio** (539726) no semestre 2025.2.

Este projeto apresenta uma plataforma web interativa para exploração de dados de qualidade do ar em 40 grandes cidades mundiais, abrangendo o período de 2023 a 2025.

### ✨ Atualizações Recentes (v2.0)
- ✅ Substituído Gráfico de Rosca por **Violin Plot** (análise de variabilidade)
- ✅ Adicionado **Ridgeline Plot** como gráfico especial (distribuição de poluição)
- ✅ Implementados 6 gráficos totais (3 básicos + 3 especiais)
- ✅ Melhorias na interatividade e responsividade
- ✅ Otimização de performance para grandes datasets

## 🌍 Cidades Monitoradas

### Ásia (11 cidades)
- **Índia**: Delhi, Mumbai, Kolkata
- **China**: Beijing, Shanghai
- **Outras**: Tokyo (Japão), Seoul (Coréia do Sul), Bangkok (Tailândia), Jakarta (Indonésia), Hong Kong, Singapore

### Europa (8 cidades)
- London (Reino Unido), Paris (França), Berlin (Alemanha), Madrid (Espanha)
- Rome (Itália), Moscow (Rússia), Amsterdam (Holanda), Warsaw (Polônia)

### América do Norte (5 cidades)
- **EUA**: New York, Los Angeles, Chicago
- **Outros**: Mexico City (México), Toronto (Canadá)

### América do Sul (4 cidades)
- São Paulo (Brasil), Rio de Janeiro (Brasil), Fortaleza (Brasil), Buenos Aires (Argentina)

### África (2 cidades)
- Cairo (Egito), Lagos (Nigéria)

### Oceania (1 cidade)
- Sydney (Austrália)

## 📈 Visualizações Implementadas

### Gráficos Normais:
1. **Gráfico de Barras** - Ranking de poluição por cidade
2. **Série Temporal** - Evolução mensal da poluição
3. **Violin Plot** - Distribuição e variabilidade da poluição por cidade

### Gráficos Especiais:
4. **Mapa Interativo Global** - Distribuição geográfica com círculos proporcionais
5. **Calendário Heatmap** - Padrões diários e sazonais de poluição
6. **Ridgeline Plot** - Visualização da distribuição de poluição por cidade

## 🔬 Poluentes Monitorados

- **PM2.5** - Material Particulado Fino
- **PM10** - Partículas Inaláveis
- **NO₂** - Dióxido de Nitrogênio
- **O₃** - Ozônio
- **SO₂** - Dióxido de Enxofre
- **AQI** - Índice de Qualidade do Ar

## � Descrição Detalhada dos Gráficos

### Gráficos Básicos:

**1. Ranking de Poluição (Gráfico de Barras)**
- Compara as 20 cidades mais poluídas para o poluente selecionado
- Utiliza cores para representar níveis de poluição (verde = bom, vermelho = crítico)
- Responsivo e interativo com animações ao carregar

**2. Evolução Temporal (Série Temporal)**
- Mostra a tendência mensal de poluição de 2023 a 2025
- Permite selecionar cidades específicas para comparação
- Usa legendas coloridas para diferenciar cidades
- Identifica padrões sazonais de poluição

**3. Violin Plot** (Novo em v2.0)
- Visualiza a distribuição e variabilidade da poluição em 8 cidades top
- **Formato**: cada "violino" = uma cidade, largura = densidade de valores
- **Linha central**: mediana dos valores de poluição
- **Pontos laterais**: quartis (25% e 75%) que indicam dispersão
- **Cores**: diferentes para cada cidade facilitam comparação
- **Interatividade**: hover mostra média, mediana, mín, máx
- **Caso de uso**: Comparar estabilidade de poluição entre cidades

### Gráficos Especiais:

**4. Mapa Interativo Global**
- Localiza geograficamente as cidades monitoradas
- Utiliza círculos proporcionais ao nível de poluição
- Interativo: hover para ver informações, zoom para exploração
- Lendas coloridas para interpretação rápida

**5. Calendário Heatmap**
- Visualiza padrões diários e sazonais de poluição
- Formato inspirado em calendários de atividades (estilo GitHub)
- Permite selecionar cidades individuais para análise profunda
- Identifica períodos críticos de poluição ao longo do ano

**6. Ridgeline Plot** (Novo em v2.0)
- Visualiza como a poluição se distribui em cada cidade
- **Formato**: "cristas" (ridges) que representam densidade de valores
- **Estrutura**: múltiplos gráficos de área sobrepostos (um por cidade)
- **Comparação**: top 10 cidades mais poluídas simultaneamente
- **Eixo X**: concentração do poluente (µg/m³)
- **Eixo Y**: cidades diferentes
- **Cores**: diferentes para cada cidade
- **Caso de uso**: Identificar padrões de distribuição de poluição

## �🚀 Como Executar

### Opção 1: Servidor Local Simples

```bash
# Navegue até a pasta do projeto
cd qualidade-ar-projeto

# Inicie um servidor HTTP local
# Com Python 3:
python -m http.server 8000

# Com Python 2:
python -m SimpleHTTPServer 8000

# Com Node.js (npx):
npx http-server -p 8000

# Acesse no navegador:
# http://localhost:8000
```

### Opção 2: Abrir Diretamente

Alguns navegadores modernos (como Firefox) permitem abrir o arquivo `index.html` diretamente. No entanto, é recomendado usar um servidor local para evitar problemas com CORS ao carregar os arquivos JSON/CSV.

## ⚙️ Funcionalidades Principais

### Sistema de Filtros Interativos
- **Poluente**: Selecione entre PM2.5, PM10, NO₂, O₃, SO₂ ou AQI
- **Ano**: Todos os anos, 2023, 2024, 2025
- **Continente**: Filtre por continente (Ásia, Europa, etc)
- **País**: Filtre por país dentro do continente
- **Cidades**: Selecione múltiplas cidades (com interface de tags)
- **Reset**: Botão para limpar todos os filtros

### Visualizações Responsivas
- Todos os 6 gráficos se ajustam ao tamanho da tela
- Legendas dinâmicas que mudam com os dados
- Tooltips informativos ao passar o mouse
- Animações suaves durante carregamento

### Seção de Estatísticas
- Poluição média geral
- Cidade mais poluída e mais limpa
- Tendência (aumento/diminuição de poluição)
- Cidades que excedem limite OMS

## 📁 Estrutura do Projeto

```
qualidade-ar-projeto/
├── index.html              # Página principal
├── README.md               # Este arquivo
├── collect_data.py         # Script de coleta de dados
├── css/
│   └── styles.css          # Estilos customizados (dark theme)
├── js/
│   └── main.js             # Lógica das visualizações (1400+ linhas)
├── data/
│   ├── air_quality_raw.csv       # Dados brutos (32.880 registros)
│   ├── annual_averages.csv       # Médias anuais por cidade
│   ├── monthly_averages.csv      # Médias mensais
│   ├── map_data.json             # Dados para o mapa (30 cidades)
│   └── daily_data.json           # Dados diários para heatmap
└── CHANGELOG.md            # Histórico de alterações
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5 & CSS3** - Estrutura e estilização
- **JavaScript (ES6+)** - Lógica da aplicação
- **D3.js v7** - Criação de visualizações customizadas
- **DC.js** - Gráficos coordenados com Crossfilter
- **Crossfilter** - Filtragem multidimensional de dados
- **Leaflet** - Mapas interativos

### Backend/Processamento
- **Python 3** - Geração e processamento de dados
- **Pandas** - Manipulação de dados
- **OpenAQ API** - Fonte de dados (simulados para o projeto)

### Design
- **Google Fonts** (Bebas Neue, Crimson Pro, JetBrains Mono)
- **Paleta de cores customizada** com tema dark
- **Animações CSS3** para transições suaves

## 🎨 Design e Estética

O projeto utiliza uma estética **dark modern** com:
- Tipografia impactante (Bebas Neue para títulos)
- Paleta de cores vibrante (cyan e magenta como cores primárias)
- Animações suaves e transições fluidas
- Layout responsivo para diferentes dispositivos
- Efeitos de glow e sombras para profundidade

## 🔍 Funcionalidades Interativas

### Filtros Globais
- Seleção de poluente (PM2.5, PM10, NO₂, O₃, SO₂, AQI)
- Filtro por ano (2023, 2024, 2025, ou todos)
- Filtro por continente
- Botão de reset para limpar todos os filtros

### Interações
- **Hover** nos gráficos para ver detalhes
- **Click** nos marcadores do mapa para informações da cidade
- **Seleção de cidade** no calendário heatmap
- **Legendas interativas** na série temporal
- Todas as visualizações são **coordenadas** e respondem aos filtros

## 📊 Insights dos Dados

### Cidades por Nível de Poluição:
**Muito Alto (PM2.5 > 80 µg/m³):**
- Delhi (Índia) - 110
- Kolkata (Índia) - 95
- Cairo (Egito) - 95
- Beijing (China) - 85

**Alto (PM2.5: 50-80 µg/m³):**
- Mumbai (Índia) - 75
- Shanghai (China) - 70
- Lagos (Nigéria) - 65
- Jakarta (Indonésia) - 60
- Bangkok (Tailândia) - 55
- Mexico City (México) - 55

**Moderado (PM2.5: 30-50 µg/m³):**
- São Paulo (Brasil) - 45
- Seoul (Coréia do Sul) - 40
- Buenos Aires (Argentina) - 38
- Los Angeles (EUA) - 35
- Rio de Janeiro (Brasil) - 35
- Hong Kong - 35
- Moscow (Rússia) - 35

**Baixo (PM2.5 < 30 µg/m³):**
- New York (EUA) - 28
- Tokyo (Japão) - 25
- Fortaleza (Brasil) - 28'
- London (Reino Unido) - 22
- Singapore - 22
- Paris (França) - 20
- Sydney (Austrália) - 15
- Amsterdam (Holanda) - 17
- Berlin (Alemanha) - 18

### Principais Descobertas:
1. **Cidades asiáticas** (especialmente Índia e China) apresentam os maiores níveis de PM2.5
2. **Padrões sazonais claros**: inverno apresenta maior poluição no hemisfério norte
3. **Variabilidade**: Delhi tem a maior variação diária (±40 µg/m³)
4. **Qualidade do ar**: cidades europeias, Oceania e algumas da América do Norte possuem melhor qualidade
5. **Hemisférios opostos**: padrões sazonais invertidos entre norte e sul
6. **Megacidades**: correlação moderada entre tamanho populacional e poluição

## 🎯 Objetivos Alcançados

✅ Comparação de níveis de poluição entre cidades e continentes  
✅ Investigação de padrões sazonais  
✅ Filtragem interativa por cidade, poluente e período  
✅ Site interativo acessível via navegador  
✅ 2 gráficos especiais + 2 gráficos normais  
✅ Design único e profissional  

## 📚 Referências

- [OpenAQ - Open Air Quality Data](https://openaq.org)
- [WHO - Air Quality Guidelines](https://www.who.int)
- [D3.js Documentation](https://d3js.org)
- [Leaflet Documentation](https://leafletjs.com)

## 👨‍💻 Autor

**Emmanuel Lima Sampaio**  
Matrícula: 539726  
Disciplina: Visualização de Dados  
Semestre: 2025.2

## � Changelog (Histórico de Versões)

### v2.0 (Janeiro 2026) - Atualização Completa
**Novos Gráficos:**
- ✅ **Violin Plot** (Gráfico 5): Análise de variabilidade de poluição por cidade
- ✅ **Ridgeline Plot** (Gráfico 6): Distribuição de poluição em múltiplas cidades

**Alterações:**
- ❌ Removido: Gráfico de Rosca (Donut Chart)
- ❌ Removido: Gráfico Aranha (Radar Chart)
- ✅ Adicionado: Sistema de legendas dinâmicas
- ✅ Melhorado: Interatividade dos gráficos
- ✅ Otimizado: Performance de renderização

**Total de Gráficos:** 6 (3 básicos + 3 especiais)

### v1.0 (2025) - Versão Inicial
- 4 gráficos base (Barras, Série Temporal, Mapa, Calendário)
- Sistema de filtros por poluente, ano, continente e país
- Gráficos de Rosca e Radar
- Dark theme com tema de cores cyan/magenta

## �📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte do curso de Visualização de Dados.

---

**Nota**: Os dados utilizados são sintéticos e foram gerados para fins de demonstração. Para dados reais e atualizados, consulte a [OpenAQ API](https://openaq.org).

