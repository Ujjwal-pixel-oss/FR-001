import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { verifyFirebaseRequest } from "@/lib/firebase-admin";
import { db } from "@/lib/firebaseAdmin";

const FILE_PATH = path.join(process.cwd(), "public/data/products.yaml");

export async function DELETE(req: Request) {
    try {
        // 1. Security Check
        const decodedToken = await verifyFirebaseRequest(req);
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Unauthorized: You must be logged in as an admin to delete products." },
                { status: 401 }
            );
        }

        // 2. Extract Product ID
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Product ID is required." },
                { status: 400 }
            );
        }

        let deleted = false;
        let deletedProductName = "";

        // 3. Remove from public/data/products.yaml
        if (fs.existsSync(FILE_PATH)) {
            const fileContents = fs.readFileSync(FILE_PATH, "utf8");
            const products = (yaml.load(fileContents) || []) as any[];

            const targetProduct = products.find((p) => p.id === id);
            if (targetProduct) {
                deleted = true;
                deletedProductName = targetProduct.name;
                const remainingProducts = products.filter((p) => p.id !== id);
                fs.writeFileSync(FILE_PATH, yaml.dump(remainingProducts), "utf8");
            }
        }

        // 4. Remove from Firestore "products" collection if exists
        try {
            const docRef = db.collection("products").doc(id);
            const doc = await docRef.get();
            if (doc.exists) {
                await docRef.delete();
                deleted = true;
            }
        } catch (dbErr) {
            console.warn("Firestore product deletion skipped or failed:", dbErr);
        }

        if (!deleted) {
            return NextResponse.json(
                { error: `Product with ID '${id}' was not found.` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Product '${deletedProductName || id}' deleted successfully from catalog.`,
            id,
        });
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete product" },
            { status: 500 }
        );
    }
}
