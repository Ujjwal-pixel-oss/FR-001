import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { verifyFirebaseRequest } from "@/lib/firebase-admin";
import { db } from "@/lib/firebaseAdmin";

const FILE_PATH = path.join(process.cwd(), "public/data/products.yaml");

export async function POST(req: Request) {
    try {
        // 1. Security Check
        const decodedToken = await verifyFirebaseRequest(req);
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Unauthorized: You must be logged in to update products." },
                { status: 401 }
            );
        }

        // 2. Read input
        const body = await req.json();
        const { id, name, price, description } = body;

        if (!id || !name) {
            return NextResponse.json(
                { error: "Missing required fields: id and name are required." },
                { status: 400 }
            );
        }

        // 3. Update in local YAML file
        let updated = false;
        let updatedProduct: any = null;
        if (fs.existsSync(FILE_PATH)) {
            const fileContents = fs.readFileSync(FILE_PATH, "utf8");
            const products = (yaml.load(fileContents) || []) as any[];

            const newProducts = products.map((p) => {
                if (p.id === id) {
                    updated = true;
                    updatedProduct = {
                        ...p,
                        name: name.trim(),
                        price: price ? String(price).trim() : null,
                        Description: description !== undefined ? String(description).trim() : p.Description,
                    };
                    return updatedProduct;
                }
                return p;
            });

            if (updated) {
                fs.writeFileSync(FILE_PATH, yaml.dump(newProducts), "utf8");
            }
        }

        // 4. Update in Firestore collection if document exists
        try {
            const productRef = db.collection("products").doc(id);
            const doc = await productRef.get();
            if (doc.exists) {
                await productRef.update({
                    name: name.trim(),
                    price: price ? String(price).trim() : "",
                    description: description !== undefined ? String(description).trim() : "",
                    updatedAt: new Date().toISOString(),
                });
            }
        } catch (dbErr) {
            console.warn("Firestore update skipped or failed:", dbErr);
        }

        if (!updated && !updatedProduct) {
            return NextResponse.json(
                { error: `Product with ID '${id}' not found.` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Product updated successfully!",
            product: updatedProduct,
        });
    } catch (error: any) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update product" },
            { status: 500 }
        );
    }
}