const path = require("path");

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

async function main() {
    await IOhandler.unzip("myfile", "unzipped");
    const paths = await IOhandler.readDir("unzipped");
    console.log(paths);
    for (const path of paths) {
        // /${path.slice(9)}
        IOhandler.grayScale(path, `grayscaled/${path.slice(9)}`);
    }
}

main();