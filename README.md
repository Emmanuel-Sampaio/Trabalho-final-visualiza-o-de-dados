# Visualização Interativa da Qualidade do Ar

![Status](https://img.shields.io/badge/status-completo-success)
![Visualização de Dados](https://img.shields.io/badge/projeto-visualização--de--dados-blue)

## 📊 Sobre o Projeto
**Site do projeto** : -[Visualização de Níveis de poluentes do ar em grandes cidades mundiais](https://emmanuel-sampaio.github.io/Trabalho-final-visualiza-o-de-dados/)
Projeto final da disciplina de Visualização de Dados desenvolvido por **Emmanuel Lima Sampaio** (539726) no semestre 2025.2.

Este projeto apresenta uma plataforma web interativa para exploração de dados de qualidade do ar em 40 grandes cidades mundiais, abrangendo o período de 2023 a 2025.

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

### América do Sul (3 cidades)
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

### Gráficos Especiais:
3. **Mapa Interativo Global** - Distribuição geográfica com círculos proporcionais
4. **Calendário Heatmap** - Padrões diários e sazonais de poluição

## 🔬 Poluentes Monitorados

- **PM2.5** - Material Particulado Fino
- **PM10** - Partículas Inaláveis
- **NO₂** - Dióxido de Nitrogênio
- **O₃** - Ozônio
- **SO₂** - Dióxido de Enxofre
- **AQI** - Índice de Qualidade do Ar

## 🚀 Como Executar

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

## 📁 Estrutura do Projeto

```
qualidade-ar-projeto/
├── index.html              # Página principal
├── README.md               # Este arquivo
├── collect_data.py         # Script de coleta de dados
├── css/
│   └── styles.css          # Estilos customizados
├── js/
│   └── main.js             # Lógica das visualizações
├── data/
│   ├── air_quality_raw.csv       # Dados brutos (32.880 registros)
│   ├── annual_averages.csv       # Médias anuais por cidade
│   ├── monthly_averages.csv      # Médias mensais
│   ├── map_data.json             # Dados para o mapa (30 cidades)
│   └── daily_data.json           # Dados diários para heatmap
└── lib/                    # Bibliotecas externas (CDN)
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

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte do curso de Visualização de Dados.

---

**Nota**: Os dados utilizados são sintéticos e foram gerados para fins de demonstração. Para dados reais e atualizados, consulte a [OpenAQ API](https://openaq.org).

