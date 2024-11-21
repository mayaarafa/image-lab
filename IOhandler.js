const fs = require("node:fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const { pipeline } = require("stream/promises");
const yauzl = require('yauzl-promise');

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(`${pathIn}.zip`);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    console.log("Extraction operation complete");
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  const filenames = await fs.promises.readdir(dir, "utf8");
  const pngPaths = [];
  for (const file of filenames) {
    // TODO
    if (path.extname(file) === ".png") {
      pngPaths.push(`unzipped/${file}`);
    }
  }
  return pngPaths;
};

const grayScale = async (rVal, gVal, bVal) => {
  const average = (rVal + gVal + bVal) / 3;
  return [average, average, average]
};

const sepia = async (rVal, gVal, bVal) => {
  const rSep = Math.min(255, (0.393 * rVal) + (0.769 * gVal) + (0.189 * bVal));
  const gSep = Math.min(255, (0.349 * rVal) + (0.686 * gVal) + (0.168 * bVal));
  const bSep = Math.min(255, (0.272 * rVal) + (0.534 * gVal) + (0.131 * bVal));

  return [rSep, gSep, bSep];
};

const invert = async (rVal, gVal, bVal) => {
  const rgbVals = [255 - rVal, 255 - gVal, 255 - bVal];
  return rgbVals;
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const filter = (pathIn, pathOut, filterType) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pathIn)
      .on("error", reject)
      .pipe(
        new PNG({
          filterType: 4,
        })
      )
      .on("error", reject)
      .on("parsed", async function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            let idx = (this.width * y + x) << 2;

            // TODO: put in helper function that you can pass a filter to eg. grayScale
            // average color
            let rgbVals;
            if (filterType.toLowerCase() === "grayscale") {
              rgbVals = await grayScale(this.data[idx], this.data[idx + 1], this.data[idx + 2]);
            } else if (filterType.toLowerCase() === "sepia") {
              rgbVals = await sepia(this.data[idx], this.data[idx + 1], this.data[idx + 2]);
            } else if (filterType.toLowerCase() === "invert") {
              rgbVals = await invert(this.data[idx], this.data[idx + 1], this.data[idx + 2]);
            }
            this.data[idx] = rgbVals[0];
            this.data[idx + 1] = rgbVals[1];
            this.data[idx + 2] = rgbVals[2];
          }
        }
        this.pack().on("error", reject).pipe(fs.createWriteStream(pathOut)).on("error", reject).on("finish", resolve);
      });
  })
};

module.exports = {
  unzip,
  readDir,
  filter,
};