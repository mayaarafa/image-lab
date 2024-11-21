const readlineSync = require("readline-sync");
const IOhandler = require("./IOhandler");
const { pathUnzipped } = require("./constants")
// const zipFilePath = path.join(__dirname, "myfile.zip");
// const pathUnzipped = path.join(__dirname, "unzipped");
// const pathProcessed = path.join(__dirname, "grayscaled");

async function main() {
    try {
        await IOhandler.unzip("myfile", pathUnzipped);
        const paths = await IOhandler.readDir(pathUnzipped);
        const promArr = [];
        // console.log(paths);
        const filterType = readlineSync.question("Pick a filter (grayscale, sepia, invert): ");
        for (const path of paths) {
            // /${path.slice(9)}
            promArr.push(IOhandler.filter(path, `filtered/${path.slice(9)}`, filterType));
        }
        await Promise.all(promArr);
        console.log("All images filtered");
    } catch (error) {
        console.error(error);
    }
}

main();