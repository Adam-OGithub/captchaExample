"use strict";
const { createCanvas } = require("canvas");
const http = require("http");
const port = 8080;

const randomDarkHex = (amount) =>
  Math.floor(Math.random() * amount + 1).toString(16);
const randomLightHex = (amount) =>
  (16 - Math.floor(Math.random() * amount + 1)).toString(16);

const randomDarkColor = (amount) => {
  return (
    "#" + randomDarkHex(amount) + randomDarkHex(amount) + randomDarkHex(amount)
  );
};

const randomLightColor = (amount) => {
  return (
    "#" +
    randomLightHex(amount) +
    randomLightHex(amount) +
    randomLightHex(amount)
  );
};

const fillBackground = (ctx, imageObj) => {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    imageObj.width,
    imageObj.height
  );

  for (let i = 0; i < 10; i++) {
    gradient.addColorStop(Math.random() * 0.1 + i * 0.1, randomLightColor(5));
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, imageObj.width, imageObj.height);
};

const printText = (ctx, imageObj) => {
  let width = (imageObj.width - 10) / imageObj.lensize;
  let height = imageObj.height;
  const getLetter = () => {
    return imageObj.charset[Math.floor(Math.random() * imageObj.len)];
  };
  const fonts = [
    "px Comic Sans MS",
    "px Helvetica",
    "px Georgia",
    "px Times New Roman",
    "px Garamond",
  ];
  for (let i = 0; i < imageObj.lensize; i++) {
    // Font Size
    let currentFont = fonts[Math.trunc(Math.random() * fonts.length)];
    let fontSize = Math.random() * 20 + 24;
    ctx.font = fontSize + currentFont;

    // Font Color
    ctx.fillStyle = randomDarkColor(10);

    // Font Location
    const topMargin = ((height - fontSize) * Math.random()) / 2.5;
    let letter = getLetter();
    ctx.fillText(letter, 5 + width * i, height / 3 + fontSize - 10 + topMargin);
    imageObj.text += letter;
  }
};

const addCircles = (ctx, imageObj) => {
  let i = 0;

  // Dark Circles
  while (i < imageObj.numberOfCircles / 2) {
    i++;
    ctx.beginPath();

    // Radius
    const radius = 10 * Math.random() + 5;

    // Center
    const centerX = imageObj.width * Math.random();
    const centerY = imageObj.height * Math.random();

    // Color
    ctx.strokeStyle = randomDarkColor(5);

    // Width
    ctx.lineWidth = 0.5 * Math.random();
    ctx.arc(
      centerX,
      centerY,
      radius,
      0,
      Math.PI * (1.5 + Math.random() * 0.5),
      false
    );
    ctx.stroke();
  }
};

const addMess = (ctx, imageObj) => {
  let i = 0;
  ctx.beginPath();
  for (let i = 0; i < imageObj.messLen; i++) {
    ctx.strokeStyle = randomDarkColor(5);
    ctx.lineWidth = 0.5 * Math.random();
    ctx.moveTo(imageObj.width * Math.random(), imageObj.height * Math.random());
    for (let i = 0; i < imageObj.messLinePoints; i++) {
      ctx.lineTo(
        imageObj.height * Math.random(),
        imageObj.width * Math.random()
      );
    }
    ctx.stroke();
  }
};
const createImg = async () => {
  const prom = new Promise((resolve, reject) => {
    const imageObj = {};
    imageObj.width = 300; //size of image width
    imageObj.height = 200; //size of image height
    imageObj.lensize = 6; //number of chars in text
    imageObj.minCircle = 100; //number of circles minimum
    imageObj.maxCircle = 150; //number of circles  max
    imageObj.messLen = 5; //number of line mess
    imageObj.messLinePoints = 7; //numbner of line points
    imageObj.charset =
      "1234567890abcdefghijklmnoprstuvyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    imageObj.len = imageObj.charset.length;
    imageObj.numberOfCircles =
      Math.random() * (imageObj.maxCircle - imageObj.minCircle) +
      imageObj.minCircle;
    imageObj.text = "";
    const canvas = createCanvas(imageObj.width, imageObj.height);
    const ctx = canvas.getContext("2d");
    fillBackground(ctx, imageObj);
    printText(ctx, imageObj);
    addCircles(ctx, imageObj);
    addMess(ctx, imageObj);
    imageObj.imageData = canvas.toDataURL("image/jpeg", 1);
    resolve(imageObj);
  });
  return prom;
};

const handleRequest = async (req, res) => {
  if (
    req.method === "GET" &&
    (req.url === "/" || req.url.indexOf("index") > -1)
  ) {
    const canvasData = await createImg();
    res.end(
      `
    <!doctype html>
    <html>
        <head>
            <title>Captcha</title>
        </head>
        <body>
        <img src="${canvasData.imageData}" alt="image not generated" width="${canvasData.width}" height="${canvasData.height}" />
        <p>String is: ${canvasData.text} </p>
        </body>
    </html>
    `
    );
  } else {
    res.end("");
  }
};

//Create a server
const server = http.createServer({}, handleRequest);

//Start server
server.listen(port, () => {
  console.log("Server Ready on http://localhost:" + port);
});
