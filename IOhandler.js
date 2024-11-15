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
    if (file.endsWith(".png")) {
      pngPaths.push(`unzipped/${file}`);
    }
  }
  return pngPaths;
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  fs.createReadStream(pathIn)
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;

          // TODO: put in helper function that you can pass a filter to eg. grayScale
          // average color
          const average = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
          this.data[idx] = average;
          this.data[idx + 1] = average;
          this.data[idx + 2] = average;
        }
      }

      this.pack().pipe(fs.createWriteStream(pathOut));
    });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};