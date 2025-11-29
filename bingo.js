const NUMBER_MAX = 50;
function shuffle(arr){
  return arr.map(a => [Math.random(), a])
            .sort((a,b) => a[0] - b[0])
            .map(a => a[1]);
}

// Funktion zum Umwandeln in Römische Zahlen
function intToRoman(num) {
    const val = [50,40,10,9,5,4,1];
    const syms = ["L","XL","X","IX","V","IV","I"];
    let roman = '';
    for(let i=0;i<val.length;i++){
        while(num >= val[i]){
            num -= val[i];
            roman += syms[i];
        }
    }
    return roman;
}

function drawCardOnCanvas(canvas, nums){
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,400,400);

  const bg = new Image();
  bg.src = 'Tor21.png';
  bg.onload = () => {
    ctx.globalAlpha = 0.3; // Transparenz für das Hintergrundbild
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0; // volle Deckkraft für Zahlen und Raster

    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2;

    const cell = 100;
    for(let r=0; r<4; r++){
      for(let c=0; c<4; c++){
        ctx.strokeRect(c*cell, r*cell, cell, cell);
        const n = nums[r*4 + c];
        ctx.fillText(intToRoman(n), c*cell + cell/2, r*cell + cell/2);
      }
    }
  };
}

function createCard(){
  const nums = shuffle(Array.from({length: NUMBER_MAX}, (_,i)=>i+1)).slice(0,16);
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  drawCardOnCanvas(canvas, nums);
  return canvas;
}

function addCardToPage(){
  const container = document.getElementById("pageContainer");
  let pages = Array.from(container.children);
  let last = pages[pages.length - 1];

  if(!last){
    last = document.createElement("div");
    last.className = "page";
    container.appendChild(last);
  }

  let rows = last.querySelectorAll(".cardRow");
  if(rows.length === 0 || rows[rows.length - 1].children.length === 2){
    const row = document.createElement("div");
    row.className = "cardRow";
    last.appendChild(row);
    rows = last.querySelectorAll(".cardRow");
  }

  const row = rows[rows.length - 1];
  if(row.children.length < 2){
    row.appendChild(createCard());
  }

  if(last.querySelectorAll("canvas").length === 4){
    const newPage = document.createElement("div");
    newPage.className = "page";
    container.appendChild(newPage);
  }
}

document.getElementById("newCard").onclick = addCardToPage;
document.getElementById("resetBtn").onclick = () => {
  document.getElementById("pageContainer").innerHTML = "";
};

document.getElementById("pdfBtn").addEventListener("click", () => {
  const canvases = Array.from(document.querySelectorAll("#pageContainer canvas"));
  if(canvases.length === 0) return alert("Keine Karten vorhanden. Bitte erst Karten erzeugen.");

  const pdf = new jspdf.jsPDF({orientation: "portrait", unit: "pt", format: "a4"});
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let x = 40, y = 40, maxH = 0;

  canvases.forEach(cv => {
    const img = cv.toDataURL("image/png");
    const w = (pageWidth / 2) - 60;
    const h = w;

    if(x + w > pageWidth){ 
      x = 40; 
      y += maxH + 40; 
      maxH = 0; 
    }
    if(y + h > pageHeight){ 
      pdf.addPage(); 
      x = 40; 
      y = 40; 
      maxH = 0; 
    }

    pdf.addImage(img, "PNG", x, y, w, h);
    x += w + 40;
    if(h > maxH) maxH = h;
  });

  pdf.save("bingo_karten.pdf");
});

