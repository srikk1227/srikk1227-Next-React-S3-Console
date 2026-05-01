"use server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { createS3Client } from "@/lib/s3Client";
import { protectApiRoute } from '@/lib/auth';
import JSZip from "jszip";

async function bulkDownload(request) {
  try {
    const { awsConfig, keys } = await request.json();
    const s3Client = createS3Client(awsConfig);
    const zip = new JSZip();

    // Download each file and add to zip
    const downloadPromises = keys.map(async (key) => {
      try {
        const response = await s3Client.send(
          new GetObjectCommand({
            Bucket: awsConfig.bucketName,
            Key: key,
          })
        );

        // Get the file content as a Buffer
        const chunks = [];
        for await (const chunk of response.Body) {
          chunks.push(chunk);
        }
        const fileContent = Buffer.concat(chunks);

        // Add to zip with the filename (remove path)
        const fileName = key.split("/").pop();
        zip.file(fileName, fileContent);
      } catch (error) {
        console.error(`Error downloading file ${key}:`, error);
        throw error;
      }
    });

    await Promise.all(downloadPromises);

    // Generate zip file
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 5 },
    });

    // Return as a streamed response
    return new NextResponse(zipContent, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="s3web-files-${new Date()
          .toISOString()
          .slice(0, 10)}.zip"`,
      },
    });
  } catch (error) {
    console.error("Bulk download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create zip file" },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(bulkDownload);
