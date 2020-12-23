const input = "/app/dallas_office.png";
const vrtPath = input.replace(".png", ".vrt");
const outputPath = "/app/tiles";

const width = 3024;
const height = 2160;

const BeginMapTilingProcessRequest = {
  documentid: "some-document-id",
  pageindex: 0,
  projectid: "some-project-id",
  pageid: "some-page-id",
  calibrationconfig: {
    scale: { from: { unit: "IN", value: 0.125 }, to: { unit: "FT", value: 1 } }, // used for recalibrating
    croppath: [
      // Need to figure out how to crop. Maybe gdalwarp?
      { x: 0.12204801647484315, y: 0.09078590793152891 },
      { x: 0.060104541602532514, y: 0.31571815727373986 },
      { x: 0.272067369787775, y: 0.6422764228605643 },
      { x: 0.7898761052951476, y: 0.6436314364059776 },
      { x: 0.8527874469953014, y: 0.44579945808058374 },
      { x: 0.6592140878979672, y: 0.10840108409642901 },
      { x: 0.12204801647484315, y: 0.09078590793152891 },
    ],
    corners: {
      topleft: { longitude: -96.79964987948574, latitude: 32.80371614021954 },
      topright: { longitude: -96.79855632413677, latitude: 32.80377452931311 },
      bottomleft: {
        longitude: -96.79960025641066,
        latitude: 32.80305959209626,
      },
      bottomright: {
        longitude: -96.79850670915472,
        latitude: 32.80311798118891,
      },
    },
    bearing: 3.6347673397717295, // used for recalibrating
    centerpoint: { longitude: -96.7990782923411, latitude: 32.803417061898756 }, // used for recalibrating
  },
};

const {
  topleft,
  topright,
  bottomleft,
  bottomright,
} = BeginMapTilingProcessRequest.calibrationconfig.corners;

const cmd = `
gdal_translate -of VRT -a_srs EPSG:4326 -ot Byte -scale \
-gcp 0 0 ${bottomleft.longitude} ${bottomleft.latitude} \
-gcp ${width} 0 ${bottomright.longitude} ${bottomright.latitude} \
-gcp ${width} ${height} ${topright.longitude} ${topright.latitude} \
-gcp 0 ${height} ${topleft.longitude} ${topleft.latitude} \
${input} ${vrtPath}
`.trim();

console.log("=== Step 1: Create VRT ===");
console.log(
  `docker run --rm -v $(pwd):/app osgeo/gdal:ubuntu-full-3.1.2 bash -c "${cmd}"`
);
console.log("");

console.log("=== Step 2: Build Tiles ===");
const tileCmd = `gdal2tiles.py --profile=mercator --processes=4 --zoom=10-24 --exclude --tilesize=512 --xyz --webviewer=none ${vrtPath} ${outputPath}`;
console.log(
  `docker run --rm -v $(pwd):/app osgeo/gdal:ubuntu-full-3.1.2 bash -c "${tileCmd}"`
);
console.log("");
