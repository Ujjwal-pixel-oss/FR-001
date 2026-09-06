import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { verifyFirebaseRequest } from "@/lib/firebase-admin";
import { db, bucket } from "@/lib/firebaseAdmin";
import { isAdmin } from "@/lib/admin-whitelist";

const FILE_PATH = path.join(process.cwd(), "public/data/products.yaml");

export async function POST(req: Request) {
    try {
        // 1. Security Check: Must be authenticated and on Admin Whitelist
        const decodedToken = await verifyFirebaseRequest(req);
        if (!decodedToken || !isAdmin(decodedToken.email)) {
            return NextResponse.json(
                { error: "Unauthorized: Admin privileges required." },
                { status: 403 }
            );
        }

        // 2. Read request body
        const body = await req.json();
        const { name, price, description, imageBase64, imageName } = body;

        if (!name || !description) {
            return NextResponse.json(
                { error: "Missing required fields: name and description are required." },
                { status: 400 }
            );
        }

        // Generate unique ID (e.g. "p-1725550000000" or slug)
        const id = `p-${Date.now()}`;
        let imagePath = "/images/placeholder.jpg";

        // 3. Handle Image Upload if provided
        if (imageBase64 && imageName) {
            try {
                const buffer = Buffer.from(imageBase64, "base64");
                const cleanName = imageName.replace(/[^a-zA-Z0-9._-]/g, "_");
                const uniqueFilename = `${Date.now()}-${cleanName}`;

                // Try Firebase Storage first
                if (bucket) {
                    try {
                        const file = bucket.file(`products/${uniqueFilename}`);
                        const contentType = imageName.endsWith(".png") ? "image/png" : "image/jpeg";
                        await file.save(buffer, { metadata: { contentType } });
                        imagePath = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`products/${uniqueFilename}`)}?alt=media`;
                    } catch (storageErr) {
                        console.warn("Firebase Storage save failed, falling back to local storage:", storageErr);
                        // Fallback: save to public/images/uploads/
                        const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir, { recursive: true });
                        }
                        const localPath = path.join(uploadsDir, uniqueFilename);
                        fs.writeFileSync(localPath, buffer);
                        imagePath = `/images/uploads/${uniqueFilename}`;
                    }
                }
            } catch (imgErr) {
                console.warn("Could not process image upload:", imgErr);
            }
        }

        // 4. Append new product to products.yaml
        const newProduct = {
            id,
            name: name.trim(),
            path: imagePath,
            price: price ? String(price).trim() : null,
            Description: description.trim(),
        };

        if (fs.existsSync(FILE_PATH)) {
            const fileContents = fs.readFileSync(FILE_PATH, "utf8");
            const products = (yaml.load(fileContents) || []) as any[];
            products.push(newProduct);
            fs.writeFileSync(FILE_PATH, yaml.dump(products), "utf8");
        }

        // 5. Also save in Firestore collection
        try {
            await db.collection("products").doc(id).set({
                id,
                name: newProduct.name,
                path: newProduct.path,
                price: newProduct.price || "",
                description: newProduct.Description,
                createdAt: new Date().toISOString(),
                addedBy: decodedToken.email || decodedToken.uid,
            });
        } catch (dbErr) {
            console.warn("Firestore product save skipped or failed:", dbErr);
        }

        return NextResponse.json({
            success: true,
            id,
            product: newProduct,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error adding product:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add product" },
            { status: 500 }
        );
    }
}