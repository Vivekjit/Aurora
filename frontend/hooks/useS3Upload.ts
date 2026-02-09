import { useState } from "react";

interface UploadResult {
    publicUrl: string;
    fileKey: string;
}

export function useS3Upload() {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File, realm: string): Promise<UploadResult | null> => {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        try {
            // STEP 1: Get the Presigned URL from our Python Backend
            const signRes = await fetch("http://localhost:8000/api/upload/sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: file.name,
                    file_type: file.type,
                    realm: realm,
                }),
            });

            if (!signRes.ok) {
                const err = await signRes.json();
                throw new Error(err.detail || "Upload rejected");
            }

            const { upload_url, file_key, public_url } = await signRes.json();

            // STEP 2: Upload DIRECTLY to AWS S3 (Bypassing Python Server)
            // We use XMLHttpRequest here because fetch() doesn't support upload progress easily
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", upload_url);
                xhr.setRequestHeader("Content-Type", file.type);

                // Progress Listener
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setProgress(Math.round(percentComplete));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        setIsUploading(false);
                        resolve({ publicUrl: public_url, fileKey: file_key });
                    } else {
                        setIsUploading(false);
                        setError("AWS S3 Rejected the file");
                        reject("S3 Error");
                    }
                };

                xhr.onerror = () => {
                    setIsUploading(false);
                    setError("Network Error during upload");
                    reject("Network Error");
                };

                xhr.send(file);
            });

        } catch (err: any) {
            setIsUploading(false);
            setError(err.message);
            return null;
        }
    };

    return { uploadFile, progress, isUploading, error };
}
