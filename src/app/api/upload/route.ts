import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Upload to Supabase Storage (assuming a 'videos' bucket exists)
    // Note: If 'videos' bucket doesn't exist, it will throw an error.
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload to storage" }, { status: 500 });
    }

    // 2. Insert into video_jobs queue for the background worker to process
    const { data: jobData, error: jobError } = await supabase
      .from("video_jobs")
      .insert([
        {
          creator_id: user.id,
          file_path: fileName,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (jobError) {
      console.error("Queue insert error:", jobError);
      return NextResponse.json({ error: "Failed to queue video for processing" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Video uploaded and queued for compression!",
      jobId: jobData.id 
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
