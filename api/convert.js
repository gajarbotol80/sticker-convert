import { execFile } from "child_process";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const inputPath = files.file.filepath;
    const outputPath = "/tmp/output.mp4";

    execFile("./bin/ffmpeg", ["-y", "-i", inputPath, "-movflags", "faststart", "-pix_fmt", "yuv420p", "-vf", "scale=512:512", outputPath], (error) => {
      if (error) return res.status(500).json({ error: "ffmpeg failed", details: error.message });

      const fileBuffer = fs.readFileSync(outputPath);
      res.setHeader("Content-Type", "video/mp4");
      res.send(fileBuffer);
    });
  });
}
