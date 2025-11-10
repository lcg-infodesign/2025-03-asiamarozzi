// definisco le variabili globali
let data; // variabile per caricare il dataset
let minLat, minLon, maxLat, maxLon;
let minElev, maxElev;
let legendaWidth; // larghezza della legenda

// carico il dataset, tenendo conto dell'header
function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log("I miei dati: ", data); // verifico di aver caricato il dataset

  // imposto una struttura che mi permette di 
  // disegnare nella posizione x e nella posizione y, 
  // la latitutidine e la longitudine di ognuno dei miei pallini

  // definisco delle scale: valore minimo e massimo di una colonna
  // definisco min e max per latitudine
  let allLat = data.getColumn("Latitude"); // tutte le latitudini
  minLat = min(allLat);
  maxLat = max(allLat);

  let allLon = data.getColumn("Longitude");
  minLon = min(allLon);
  maxLon = max(allLon);

  let allElev = data.getColumn("Elevation");
  minElev = min(allElev);
  maxElev = max(allElev);
}

function draw() {
  background(20);

  // titolo che prende lo spazio rimanente a sinistra
  let titleWidth = width * 0.8; // larghezza  per il titolo (80% del canvas)
  titleText = "VULCANI"; // titolo
  // trova una dimensione del testo che si adatti alla larghezza disponibile
    let targetTextSize = 1;
    let targetTextWidth = 0;
    
    while (targetTextWidth < titleWidth * 0.95) { 
        targetTextSize += 1;
        
        // 1. imposta la dimensione per la misurazione
        textSize(targetTextSize);
        // 2. misura la larghezza del testo
        targetTextWidth = textWidth(titleText);
    }
    targetTextSize -= 1; // riduce di 1 per evitare overflow
    let titleHeight = targetTextSize + 15 * 2; // calcola l'altezza occupata dal titolo (per sapere quanto spazio è disponibile per la mappa)
  
  fill(255); 
  textAlign(LEFT, TOP);
  textSize(targetTextSize); // dimensione calcolata nel ciclo while
  textStyle(BOLD);
  text(titleText, 20, 15); // scrive il testo nella sua posizione

  drawLegenda(titleHeight);

  // Calcolo l'area della mappa (titolo + griglia)
  let mapWidth = width * 0.8; 

  // ⭐ NUOVA LOGICA: Aggiorna le coordinate nella legenda
  // Controlla se il mouse è nella regione della mappa (esclusa la legenda)
  if (mouseX < mapWidth && mouseX > 20 && mouseY > titleHeight && mouseY < height - 40) {
    
    // Converte le coordinate pixel del mouse in coordinate geografiche
    // (Inverso della funzione map usata in drawGrid/drawVulcano)
    let mouseLon = map(mouseX, 20, mapWidth - 20, minLon, maxLon);
    let mouseLat = map(mouseY, height - 40, titleHeight, minLat, maxLat);
    
    // Chiama la nuova funzione per scrivere le coordinate nella legenda
    drawCoordinatesInLegenda(mouseLat, mouseLon);
  } else {
    // Se il mouse non è sulla mappa, mostriamo dei placeholder (es. trattini o 0.00)
    drawCoordinatesInLegenda(null, null);
  }

  // disegna griglia
  drawGrid(titleWidth, titleHeight);

  // disegna glifo
  drawVulcano(titleWidth, titleHeight); // Passa la larghezza disponibile per la mappa
}

// funzione separata per disegnare la legenda
function drawLegenda(titleHeight) {
  // calcola le posizioni e le dimensioni della legenda
  legendaWidth = width * 0.2;   
  let legendaX = width - legendaWidth; 
  textAlign(LEFT, TOP);

  // sfondo 
  fill(30);
  noStroke();
  rect(legendaX, 0, legendaWidth, height); 
  let currentY = titleHeight;
  let sampleSize = 30; // dimensione dei glifi nella legenda

  // tipi di vulcano
  push();
  fill(255);
  textSize(28);
  textStyle(BOLD);
  text("TIPO DI VULCANO", legendaX + 20, currentY);
  pop();
  currentY += 10;

  // lista dei tipi e dei colori
  let types = [
    { type: 'Stratovolcano', color: getColorByType('Stratovolcano') },
    { type: 'Shield', color: getColorByType('Shield') },
    { type: 'Caldera', color: getColorByType('Caldera') },
    { type: 'Submarine', color: getColorByType('Submarine') },
    { type: 'Fissure Vent', color: getColorByType('Fissure Vent') },
    { type: 'Other', color: getColorByType('Sconosciuto') },
  ];
  textSize(18); 
  textStyle(NORMAL);

  for (let item of types) {
    currentY += 45; 
    
    // triangolo
    fill(item.color);
    let triX = legendaX + 80; // centro orizzontale
    let triY = currentY + sampleSize / 2; // centro verticale
    
    triangle(
        triX, triY - sampleSize / 2, // x1, y1 (Punta in alto)
        triX - sampleSize / 2, triY + sampleSize / 2, // x2, y2 (Basso sx)
        triX + sampleSize / 2, triY + sampleSize / 2  // x3, y3 (Basso dx)
    );
    
    // testo con nome del vulcano
    fill(255);
    text(item.type, triX + 30, currentY+5); 
  }

  // latitudine
  push();
  currentY += 70; 
  fill(255);
  textSize(28);
  textStyle(BOLD);
  text("LATITUDINE", legendaX + 65, currentY);
  pop();

  // longitudine
  push();
  currentY += 80; 
  fill(255);
  textSize(28);
  textStyle(BOLD);
  text("LONGITUDINE", legendaX + 50, currentY);
  pop();
}

// scrive latitudine e longitudine in tempo reale nella legenda
function drawCoordinatesInLegenda(lat, lon) {
  push(); 
  legendaWidth = width * 0.2;   
  let legendaX = width - legendaWidth; 

  fill(255); 
  textSize(20); 
  textStyle(NORMAL);
  textAlign(LEFT, TOP);

  // controlla se le coordinate sono valide (mouse sulla mappa)
  let latText = lat !== null ? lat.toFixed(2) + '°' : '--';
  let lonText = lon !== null ? lon.toFixed(2) + '°' : '--';

  // scrive la Latitudine
  let yLatTitle = 630;
  text(latText, legendaX + 120, yLatTitle + 40);
  // scrive la Longitudine
  let yLonTitle = 710; 
  text(lonText, legendaX + 120, yLonTitle + 40);
  pop();
}

// disegno la griglia di latitudine e longitudine
function drawGrid(mapWidth, titleHeight) {
  // linee di longitudine (verticali)
  let lonStep = 30; // 30 gradi come da tua richiesta
  for (let lon = Math.ceil(minLon / lonStep) * lonStep; lon <= maxLon; lon += lonStep) {
  let x = map(lon, minLon, maxLon, 20, mapWidth - 20); 
    
    // disegna la linea verticale
    stroke(50);
    strokeWeight(1);
    line(x, titleHeight, x, height - 40);
    
    // etichetta longitudine
    fill(150);
    noStroke();
    textSize(10);
    textAlign(CENTER, TOP);
    text(lon + "°", x, height - 35);
  }
  // linee di latitudine (orizzontali)
  let latStep = 30; 
  for (let lat = Math.ceil(minLat / latStep) * latStep; lat <= maxLat; lat += latStep) {
  let y = map(lat, minLat, maxLat, height - 40, titleHeight);
    
    // disegna la linea orizzontale
    stroke(50);
    strokeWeight(1);
    line(20, y, mapWidth - 20, y);
    
    // etichetta latitudine
    fill(150);
    noStroke();
    textSize(10);
    textAlign(RIGHT, CENTER);
    text(lat + "°", 15, y);
  }
}

// funzione per assegnare un colore in base al tipo di vulcano
function getColorByType(type) {
  // Rimuoviamo gli spazi vuoti e convertiamo in minuscolo per una corrispondenza robusta
  const normalizedType = type.trim().toLowerCase(); 

  // Definiamo i colori per i tipi più comuni
  switch (normalizedType) {
    case 'stratovolcano': // stratovulcano
      return color(203, 14, 18); 
    case 'shield': // vulcano a scudo
      return color(229, 100, 49); 
    case 'caldera': // caldera
      return color(243, 144, 60); 
    case 'submarine': // vulcano sottomarino
      return color(248, 179, 57); 
    case 'fissure vent':
      return color(255, 222, 106); 
    default: // altri
      return color(129, 129, 129); 
  }
}

// disegno un glifo per ogni riga del dataset
function drawVulcano(mapWidth, titleHeight){
  let mapHeight = height - titleHeight; // altezza disponibile per la mappa
  
  // Definisco le dimensioni minima e massima per il glifo (versione a dimensione fissa)
  let size = 16; 

  for(let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++){
    // leggo i dati della singola riga
    let lon = data.getNum(rowNumber, "Longitude");
    let lat = data.getNum(rowNumber, "Latitude");
    let name = data.getString(rowNumber, "VolcanoName")
    let type = data.getString(rowNumber, "Type"); // Nuovo: leggo il tipo

    // Ottengo il colore in base al tipo di vulcano
    let volcanoColor = getColorByType(type); 

    // converto le coordinate geografiche in coordinate pixel
    let x = map(lon, minLon, maxLon, 20, mapWidth - 20);
    let y = map(lat, minLat, maxLat, height-40, titleHeight);
    
    // Calcolo le coordinate dei tre vertici del triangolo
    let x1 = x;               
    let y1 = y - size / 2;    
    let x2 = x - size / 2;    
    let y2 = y + size / 2;    
    let x3 = x + size / 2;    
    let y3 = y + size / 2;    


    // interazione con l'utente:
    let d = dist(x, y, mouseX, mouseY);
    if(d < size/2){ 
      // Se il mouse è sopra, usa il giallo (override)
      stroke("white");
      strokeWeight(1.5);
    } else {
      // Altrimenti, usa il colore determinato dal tipo
      noStroke();
    }

    // Disegna il triangolo
         fill(volcanoColor);
    triangle(x1, y1, x2, y2, x3, y3); 
    
    // Etichetta del nome e del tipo in caso di mouse over
    if(d < size/2){
      fill("white");
      noStroke();
      textAlign(LEFT, CENTER); 
      text(name, x+10, y); 
    }
  }
}