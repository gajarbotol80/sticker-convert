import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const ffmpeg = createFFmpeg({ log: false });
    await ffmpeg.load();

    const inputFile = files.file.filepath;
    const data = await fetchFile(inputFile);

    ffmpeg.FS("writeFile", "input.webp", data);
    await ffmpeg.run("-i", "input.webp", "-movflags", "faststart", "-pix_fmt", "yuv420p", "output.mp4");

    const output = ffmpeg.FS("readFile", "output.mp4");
    res.setHeader("Content-Type", "video/mp4");
    res.send(Buffer.from(output));
  });
             }
