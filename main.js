const path = require("path");
const readlineSync = require("readline-sync");
const IOhandler = require("./IOhandler");
// const zipFilePath = path.join(__dirname, "myfile.zip");
// const pathUnzipped = path.join(__dirname, "unzipped");
// const pathProcessed = path.join(__dirname, "grayscaled");

async function main() {
    await IOhandler.unzip("myfile", "unzipped");
    const paths = await IOhandler.readDir("unzipped");
    // console.log(paths);
    const filterType = readlineSync.question("Pick a filter (grayscale, sepia, invert): ");
    for (const path of paths) {
        // /${path.slice(9)}
        IOhandler.filter(path, `filtered/${path.slice(9)}`, filterType);
    }
}

main();