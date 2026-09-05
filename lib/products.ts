import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export interface Product {
    id: string;
    name: string;
    path: string;
    price: string | null;
    Description: string;
}

export function getProducts(): Product[] {
    const filePath = path.join(process.cwd(), "public/data/products.yaml");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const products = yaml.load(fileContents) as Product[];
    return products;
}
